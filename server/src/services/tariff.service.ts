import { Prisma, TariffVersionReason, type TariffVersion } from "@prisma/client";
import { type PositionPrice } from "@keepit/schemas";

import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import {
    buildTariffVersionSnapshot,
    hashTariffSnapshot,
    parseTariffVersionSnapshot,
} from "../schemas/tariff-version-schema.js";
import {
    calculatePrice,
    loadTariffForPricing,
    resolveCell, type PriceFailureReason
} from "../utils/products.js";

import type {
    CreateTariffInput,
    CreateTariffGroupInput,
    UpdateTariffGroupInput,
    CreateStandardTierInput,
    UpdateStandardTierInput,
    UpdateTariffCellInput,
    UpsertCustomerPriceInput,
    DeleteCustomerPriceInput,
    CreateStandardDurationInput,
} from '@keepit/schemas';

/* ========== Types ========== */

const TARIFF_INCLUDE = {
    contract: {
        include: {
            translations: true
        }
    },
    tariffGroup: {
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    }
                }
            },
        }
    },
    cells: {
        orderBy: { duration: 'asc' },
    },
    customerPrices: true,
} as const;

const TARIFF_GROUP_INCLUDE = {
    products: {
        include: {
            product: {
                include: {
                    translations: true,
                },
            },
        },
    },
    tariffs: {
        include: {
            contract: {
                include: {
                    translations: true,
                },
            },
            cells: {
                orderBy: { duration: 'asc' },
            },
            customerPrices: true,
        },
    },
} as const;

/**
 * Zieht kundenspezifische Preise auf eine geänderte Koordinate nach.
 *
 * Kundenpreise hängen bewusst an `(duration, min_quantity)` statt an einer
 * `cellId` — das lässt sie ein Wiederherstellen überleben, macht sie aber
 * unsichtbar wirkungslos, sobald jemand die Zeile oder Spalte verschiebt.
 * Deshalb wandern sie hier mit, statt still ins Leere zu zeigen.
 *
 * Auf der Zielkoordinate liegende Preise werden vorher entfernt. Dort kann es
 * keine Zeile bzw. Spalte geben — Überschneidungen und doppelte Laufzeiten sind
 * abgelehnt —, es handelt sich also um Waisen aus der Zeit vor dieser Pflege.
 * Ohne dieses Aufräumen bräche der Unique-Index beim Verschieben.
 *
 * Beide Funktionen erwarten eine Transaktion: Verschieben und Strukturänderung
 * müssen gemeinsam gelten oder gemeinsam ausbleiben.
 */
async function moveCustomerPricesToMinQuantity(
    tx: Prisma.TransactionClient,
    tariffId: string,
    from: number,
    to: number,
) {
    if (from === to) return;

    await tx.tariffCustomerPrice.deleteMany({ where: { tariffId, min_quantity: to } });
    await tx.tariffCustomerPrice.updateMany({
        where: { tariffId, min_quantity: from },
        data: { min_quantity: to },
    });
}

/** Siehe {@link moveCustomerPricesToMinQuantity}. */
async function moveCustomerPricesToDuration(
    tx: Prisma.TransactionClient,
    tariffId: string,
    from: number,
    to: number,
) {
    if (from === to) return;

    await tx.tariffCustomerPrice.deleteMany({ where: { tariffId, duration: to } });
    await tx.tariffCustomerPrice.updateMany({
        where: { tariffId, duration: from },
        data: { duration: to },
    });
}

/**
 * Berechnet den Preis nach dem Schreiben oder Löschen eines Overrides neu.
 *
 * Wichtig ist das erneute Laden: Der vor der Änderung geladene Tarif enthält
 * den neuen Override noch nicht und würde weiterhin den alten Preis liefern.
 */
async function recalculateAfterOverrideChange(
    params: { productId: string; contractId: string; duration: number; quantity: number; customerId: string },
    failureMessage: string,
): Promise<PositionPrice> {
    const { productId, contractId, duration, quantity, customerId } = params;

    const result = await calculatePrice({ productId, contractId, duration, quantity, customerId });

    if (!result.ok) {
        throw new AppException(failureMessage, 500, result.reason);
    }

    // Ein Override adressiert eine Tarif-Zelle, keine Angebotsposition — es gibt
    // hier keine Freimonate, die abzuziehen wären.
    return {
        eur_user_month: result.breakdown.unitPrice,
        total_cents: result.price,
        discount_cents: 0,
        fromSnapshot: false,
    };
}

type QuantityRange = { min_quantity: number; max_quantity: number | null };

function assertQuantityRange({ min_quantity, max_quantity }: QuantityRange) {
    if (!Number.isInteger(min_quantity) || min_quantity <= 0) {
        throw new AppException(
            "Die Mengenuntergrenze muss eine positive Ganzzahl sein.",
            422,
            "INVALID_QUANTITY_RANGE",
        );
    }

    if (max_quantity !== null && (!Number.isInteger(max_quantity) || max_quantity < min_quantity)) {
        throw new AppException(
            "Die Mengenobergrenze muss eine Ganzzahl >= der Untergrenze sein.",
            422,
            "INVALID_QUANTITY_RANGE",
        );
    }
}

/**
 * Verhindert überlappende Mengenstaffeln. Ohne diese Prüfung nimmt
 * {@link resolveCell} bei Überschneidung einfach den ersten Treffer — welcher
 * Preis gilt, wäre dann von der Zeilenreihenfolge abhängig. Die Prüfung hält
 * zugleich `min_quantity` innerhalb eines Tarifs eindeutig und macht sie damit
 * zum tragfähigen Sortierschlüssel.
 */
function assertNoOverlap(
    existing: ReadonlyArray<{ id: string } & QuantityRange>,
    candidate: QuantityRange,
    ignoreRowId?: string,
) {
    const candidateMax = candidate.max_quantity ?? Number.POSITIVE_INFINITY;

    const overlapping = existing.find((row) => {
        if (row.id === ignoreRowId) return false;
        const rowMax = row.max_quantity ?? Number.POSITIVE_INFINITY;
        return candidate.min_quantity <= rowMax && row.min_quantity <= candidateMax;
    });

    if (overlapping) {
        throw new AppException(
            `Die Mengenstaffel überschneidet sich mit ${overlapping.min_quantity}–${overlapping.max_quantity ?? "∞"}.`,
            422,
            "QUANTITY_RANGE_OVERLAP",
        );
    }
}

/** Genau die Felder, die in einen Versions-Snapshot einfließen. */
const TARIFF_STRUCTURE_INCLUDE = {
    cells: true,
} as const satisfies Prisma.TariffInclude;

/**
 * Versiegelt den aktuellen Zustand einer Preistabelle als unveränderliche
 * Version.
 *
 * Existiert bereits eine Version mit identischem Inhalt (gleicher Hash), wird
 * diese zurückgegeben statt eine Duplikat-Version anzulegen. Dadurch erzeugt
 * wiederholtes Versiegeln ohne zwischenzeitliche Änderung keine neuen Einträge.
 *
 * Ohne `tx` wird eine eigene Transaktion geöffnet — der Advisory Lock, der die
 * Vergabe der Versionsnummer serialisiert, ist transaktionsgebunden und hätte
 * außerhalb einer Transaktion keine Wirkung.
 */
export async function sealTariffVersion(
    tariffId: string,
    reason: TariffVersionReason,
    actorId: string | null,
    tx?: Prisma.TransactionClient,
): Promise<TariffVersion> {
    if (!tx) {
        return prisma.$transaction((client) => sealTariffVersion(tariffId, reason, actorId, client));
    }

    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`tariff-version:${tariffId}`}))::text AS "lock"`;

    const tariff = await tx.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: TARIFF_STRUCTURE_INCLUDE,
    });

    const tiers = await tx.standardTier.findMany({ orderBy: { min_quantity: 'asc' } });
    const snapshot = buildTariffVersionSnapshot({ ...tariff, tiers });
    const hash = hashTariffSnapshot(snapshot);

    const existing = await tx.tariffVersion.findFirst({ where: { tariffId, hash } });
    if (existing) return existing;

    const latest = await tx.tariffVersion.aggregate({
        where: { tariffId },
        _max: { version: true },
    });

    return tx.tariffVersion.create({
        data: {
            tariffId,
            version: (latest._max.version ?? 0) + 1,
            hash,
            snapshot: snapshot as unknown as Prisma.InputJsonValue,
            reason,
            createdById: actorId,
        },
    });
}

/**
 * Übersetzt einen Grund aus der Preisrechnung in eine Antwort.
 *
 * Meldung und Status stehen beieinander, weil sie zusammengehören — zwei
 * parallele Tabellen könnten auseinanderlaufen. `INVALID_INPUT` fehlt bewusst:
 * das ist ein Fehler des Aufrufers, kein unkonfigurierter Tarif, und wird an
 * den Stellen behandelt, die die Eingabe kennen.
 */
const PRICE_FAILURE: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, { status: number; message: string }> = {
    NO_TARIFF: { status: 404, message: "Tariff für das Produkt/den Vertrag wurde nicht gefunden." },
    NO_CELL: { status: 404, message: "Für diese Laufzeit und Menge ist kein Preis hinterlegt." },
    NO_COLUMN: { status: 422, message: "Laufzeit ist in keiner Tariff-Spalte konfiguriert." },
    NO_ROW: { status: 422, message: "Menge liegt außerhalb aller konfigurierten Mengenbereiche." },
};

const priceFailure = (reason: Exclude<PriceFailureReason, 'INVALID_INPUT'>) =>
    new AppException(PRICE_FAILURE[reason].message, PRICE_FAILURE[reason].status, reason);

/* ========== Queries ========== */

export async function getTariffGroups() {
    return prisma.tariffGroup.findMany({
        include: TARIFF_GROUP_INCLUDE,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
}

export async function getTariffGroup(id: string) {
    const group = await prisma.tariffGroup.findUnique({
        where: { id },
        include: TARIFF_GROUP_INCLUDE,
    });

    if (!group) {
        throw new AppException("TariffGroup not found.", 404, "TARIFF_GROUP_NOT_FOUND");
    }

    return group;
}

export async function getTariff(tariffId: string) {
    const tariff = await prisma.tariff.findUnique({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });

    if (!tariff) {
        throw new AppException("Tariff not found.", 404, "TARIFF_NOT_FOUND");
    }

    return tariff;
}

/**
 * Versionshistorie einer Preistabelle, neueste zuerst.
 *
 * `isCurrent` markiert die Version, deren Inhalt dem aktuellen Zustand der
 * Tabelle entspricht; `usageCount` zeigt, von wie vielen Angebotspositionen
 * diese Version als Preisgrundlage angepinnt wurde.
 */
export async function getTariffVersions(tariffId: string) {
    const tariff = await prisma.tariff.findUnique({
        where: { id: tariffId },
        include: TARIFF_STRUCTURE_INCLUDE,
    });

    if (!tariff) {
        throw new AppException("Tariff not found.", 404, "TARIFF_NOT_FOUND");
    }

    const tiers = await prisma.standardTier.findMany({ orderBy: { min_quantity: 'asc' } });
    const currentHash = hashTariffSnapshot(buildTariffVersionSnapshot({ ...tariff, tiers }));

    const versions = await prisma.tariffVersion.findMany({
        where: { tariffId },
        orderBy: { version: 'desc' },
        include: {
            createdBy: { select: { id: true, name: true } },
            _count: { select: { offerPositions: true } },
        },
    });

    return versions.map(({ _count, ...version }) => ({
        ...version,
        isCurrent: version.hash === currentHash,
        usageCount: _count.offerPositions,
    }));
}

/**
 * Die wählbaren Laufzeiten. Seit die Spaltenachse global ist, hängen sie weder
 * am Produkt noch am Vertrag — die Parameter bleiben nur, damit der bestehende
 * Endpunkt unverändert weiterläuft, bis der Client auf
 * {@link getStandardDurations} umgestellt ist.
 */
export async function getTariffDurations(_productId: string, _contractId: string): Promise<number[]> {
    const durations = await getStandardDurations();
    return durations.map((duration) => duration.months);
}

/**
 * Preis-Vorschau aus dem aktuell gültigen Tarif.
 *
 * `freeMonths` ist ein Parameter dieser Funktion, nicht der Preisrechnung:
 * `calculatePrice` liefert immer brutto, der Wert der Freimonate wird hier
 * daraus abgeleitet und getrennt als `discount_cents` ausgewiesen — dieselbe
 * Aufteilung, in der eine Position später gespeichert wird (siehe
 * `pricePositions` in offer.service). Damit zeigt die Vorschau dieselben Zahlen
 * wie das fertige Angebot.
 */
export async function getTariffPrice(
    productId: string,
    contractId: string,
    duration: number,
    quantity: number,
    customerId?: string,
    freeMonths?: number
): Promise<PositionPrice> {
    const free_months = freeMonths ?? 0;

    // Muss hier geprüft werden: die Preisrechnung kennt keine Freimonate.
    if (!Number.isInteger(free_months) || free_months < 0 || free_months > duration) {
        throw new AppException(
            "freeMonths muss eine Ganzzahl zwischen 0 und duration sein.",
            400,
            "INVALID_INPUT"
        );
    }

    const result = await calculatePrice({
        productId,
        contractId,
        duration,
        quantity,
        customerId,
    });

    if (!result.ok) {
        if (result.reason === 'INVALID_INPUT') {
            throw new AppException(
                "duration und quantity müssen positive Ganzzahlen sein.",
                400,
                "INVALID_INPUT"
            );
        }

        throw priceFailure(result.reason);
    }

    const eur_user_month = result.breakdown.unitPrice;

    return {
        eur_user_month,
        total_cents: result.price,
        discount_cents: eur_user_month * quantity * free_months,
        fromSnapshot: false,
    };
}

/* ========== Mutations ========== */

export async function createTariffGroup(input: CreateTariffGroupInput) {
    const { products } = input;

    const contracts = await prisma.contract.findMany({ select: { id: true } });

    const group = await prisma.$transaction(async (tx) => {
        const created = await tx.tariffGroup.create({
            data: {
                products: {
                    create: products.map(productId => ({ productId })),
                },
            },
        });

        if (contracts.length > 0) {
            await tx.tariff.createMany({
                data: contracts.map(c => ({
                    tariffGroupId: created.id,
                    contractId: c.id,
                })),
            });
        }

        return created;
    });

    return prisma.tariffGroup.findUniqueOrThrow({
        where: { id: group.id },
        include: TARIFF_GROUP_INCLUDE,
    });
}

export async function updateTariffGroup(id: string, input: UpdateTariffGroupInput) {
    const { products } = input;

    if (products !== undefined) {
        await prisma.tariffGroupProduct.deleteMany({
            where: { tariffGroupId: id },
        });

        if (products.length > 0) {
            await prisma.tariffGroup.update({
                where: { id },
                data: {
                    products: {
                        create: products.map(productId => ({ productId })),
                    },
                },
            });
        }
    }

    return prisma.tariffGroup.findUniqueOrThrow({
        where: { id },
        include: TARIFF_GROUP_INCLUDE,
    });
}

/**
 * Löscht eine Tarifgruppe samt ihrer Preistabellen.
 *
 * Die Versionsprüfung ist dieselbe wie in {@link deleteTariff} und hier nicht
 * verzichtbar: das Löschen cascadet über die Gruppe auf ihre `Tariff`-Zeilen,
 * an denen `TariffVersion` per `onDelete: Restrict` hängt. Ohne diese Prüfung
 * käme der Fremdschlüsselfehler roh als 500 zurück statt als verständliche
 * Meldung — und der Schutz der angepinnten Angebotspreise wäre eine
 * Zufallseigenschaft der Datenbank statt einer Regel der Fachlogik.
 */
export async function deleteTariffGroup(id: string): Promise<void> {
    const versionCount = await prisma.tariffVersion.count({
        where: { tariff: { tariffGroupId: id } },
    });

    if (versionCount > 0) {
        throw new AppException(
            "Tarifgruppen mit Versionshistorie können nicht gelöscht werden.",
            409,
            "TARIFF_HAS_VERSIONS",
        );
    }

    await prisma.tariffGroup.delete({
        where: { id },
    });
}

export async function createTariff(tariffGroupId: string, input: CreateTariffInput) {
    const { contractId } = input;

    const existing = await prisma.tariff.findFirst({
        where: { tariffGroupId, contractId },
    });

    if (existing) {
        throw new AppException(
            "Für diesen Vertrag existiert in dieser Gruppe bereits eine Preistabelle.",
            409,
            "TARIFF_ALREADY_EXISTS",
        );
    }

    const tariff = await prisma.tariff.create({
        data: {
            tariffGroupId,
            contractId,
        },
    });

    return prisma.tariff.findUniqueOrThrow({
        where: { id: tariff.id },
        include: TARIFF_INCLUDE,
    });
}

export async function deleteTariff(tariffId: string): Promise<void> {
    const versionCount = await prisma.tariffVersion.count({ where: { tariffId } });

    if (versionCount > 0) {
        throw new AppException(
            "Preistabellen mit Versionshistorie können nicht gelöscht werden.",
            409,
            "TARIFF_HAS_VERSIONS",
        );
    }

    await prisma.tariff.delete({
        where: { id: tariffId }
    });
}

/**
 * Setzt eine Preistabelle auf den Stand einer früheren Version zurück.
 *
 * Der aktuelle Zustand wird vorher als `RESTORE`-Version versiegelt und geht
 * damit nie verloren. Die Struktur wird in-place ersetzt — der `Tariff` selbst
 * bleibt bestehen, damit angepinnte Angebotsversionen und die an Koordinaten
 * hängenden Kundenpreise nicht brechen.
 */
export async function restoreTariffVersion(tariffId: string, versionId: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
        const version = await tx.tariffVersion.findUnique({ where: { id: versionId } });

        if (!version || version.tariffId !== tariffId) {
            throw new AppException("Tariff version not found.", 404, "TARIFF_VERSION_NOT_FOUND");
        }

        if (version.snapshotVersion !== 1) {
            throw new AppException(
                `Snapshot-Version ${version.snapshotVersion} wird nicht unterstützt.`,
                422,
                "UNSUPPORTED_SNAPSHOT_VERSION",
            );
        }

        const snapshot = parseTariffVersionSnapshot(version.snapshot);

        await sealTariffVersion(tariffId, TariffVersionReason.RESTORE, actorId, tx);

        // Nur die Zellen dieses Tarifs. Die Mengenstaffeln gehören der Gruppe
        // und werden von allen Verträgen darin geteilt — ein Restore eines
        // einzelnen Tarifs darf sie nicht unter den Geschwistern wegziehen.
        // Zellen auf einer Koordinate ohne Staffel bleiben erhalten und sind
        // wieder erreichbar, sobald die Staffel zurückkommt.
        await tx.tariffCell.deleteMany({ where: { tariffId } });

        const cells = snapshot.cells.flatMap((cell) =>
            cell.price === null
                ? []
                : [{ tariffId, duration: cell.duration, min_quantity: cell.min_quantity, price: cell.price }],
        );

        if (cells.length > 0) {
            await tx.tariffCell.createMany({ data: cells });
        }

        return tx.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: TARIFF_INCLUDE,
        });
    });
}

/**
 * Legt eine Mengenstaffel an. Sie gilt für *alle* Preistabellen — Zellen
 * entstehen erst, wenn ein Preis eingetragen wird.
 */
export async function createStandardTier(input: CreateStandardTierInput) {
    const { min_quantity, max_quantity } = input;

    assertQuantityRange({ min_quantity, max_quantity });

    const existing = await prisma.standardTier.findMany({
        select: { id: true, min_quantity: true, max_quantity: true },
    });
    assertNoOverlap(existing, { min_quantity, max_quantity });

    return prisma.standardTier.create({ data: { min_quantity, max_quantity } });
}

export async function updateStandardTier(tierId: string, input: UpdateStandardTierInput) {
    const { min_quantity, max_quantity } = input;

    return prisma.$transaction(async (tx) => {
        const current = await tx.standardTier.findUnique({
            where: { id: tierId },
            select: { id: true, min_quantity: true, max_quantity: true },
        });

        if (!current) {
            throw new AppException("Mengenstaffel nicht gefunden.", 404, "NO_ROW");
        }

        const next: QuantityRange = {
            min_quantity: min_quantity ?? current.min_quantity,
            max_quantity: max_quantity !== undefined ? max_quantity : current.max_quantity,
        };

        assertQuantityRange(next);

        const siblings = await tx.standardTier.findMany({
            select: { id: true, min_quantity: true, max_quantity: true },
        });
        assertNoOverlap(siblings, next, tierId);

        // Beim Verschieben der Untergrenze wandern Zellen und Kundenpreise mit:
        // sie hängen an der Koordinate, nicht an der Staffel-Id, und zeigten
        // sonst auf eine Zeile, die es nicht mehr gibt. (Beim *Löschen* bleiben
        // sie dagegen liegen — siehe deleteStandardTier.)
        if (next.min_quantity !== current.min_quantity) {
            const tariffs = await tx.tariff.findMany({ select: { id: true } });

            for (const tariff of tariffs) {
                await tx.tariffCell.deleteMany({
                    where: { tariffId: tariff.id, min_quantity: next.min_quantity },
                });
                await tx.tariffCell.updateMany({
                    where: { tariffId: tariff.id, min_quantity: current.min_quantity },
                    data: { min_quantity: next.min_quantity },
                });
                await moveCustomerPricesToMinQuantity(
                    tx, tariff.id, current.min_quantity, next.min_quantity,
                );
            }
        }

        return tx.standardTier.update({ where: { id: tierId }, data: next });
    });
}

/**
 * Entfernt nur den Listeneintrag. Hinterlegte Preise auf dieser Mengenstufe
 * bleiben stehen — genau wie bei {@link deleteStandardDuration}. Sie sind nicht
 * mehr erreichbar und kommen vollständig zurück, sobald die Staffel wieder
 * angelegt wird; ein Klick soll keine Preise in jeder Gruppe vernichten.
 */
export async function deleteStandardTier(tierId: string): Promise<void> {
    const existing = await prisma.standardTier.findUnique({ where: { id: tierId } });

    if (!existing) {
        throw new AppException("Mengenstaffel nicht gefunden.", 404, "NO_ROW");
    }

    await prisma.standardTier.delete({ where: { id: tierId } });
}

export async function getStandardTiers() {
    return prisma.standardTier.findMany({ orderBy: { min_quantity: 'asc' } });
}

/**
 * Setzt den Listenpreis an einer Koordinate.
 *
 * Muss ein Upsert sein: eine Zelle entsteht erst mit ihrem Preis — vorher gibt
 * es an dieser Koordinate schlicht keine Zeile.
 */
export async function updateTariffCell(tariffId: string, input: UpdateTariffCellInput) {
    const { duration, min_quantity, default_price } = input;

    return prisma.tariffCell.upsert({
        where: {
            tariffId_duration_min_quantity: { tariffId, duration, min_quantity },
        },
        create: { tariffId, duration, min_quantity, price: default_price },
        update: { price: default_price },
    });
}

export async function upsertCustomerPrice(input: UpsertCustomerPriceInput) {
    const { productId, contractId, duration, quantity, customerId, price } = input;

    const tariff = await loadTariffForPricing(productId, contractId, customerId);
    if (!tariff) throw priceFailure("NO_TARIFF");

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) throw priceFailure(resolved.reason);

    await prisma.tariffCustomerPrice.upsert({
        where: {
            tariffId_customerId_productId_duration_min_quantity: {
                tariffId: tariff.id,
                customerId,
                productId,
                duration: resolved.cell.duration,
                min_quantity: resolved.tier.min_quantity,
            },
        },
        create: {
            tariffId: tariff.id,
            customerId,
            productId,
            duration: resolved.cell.duration,
            min_quantity: resolved.tier.min_quantity,
            price,
        },
        update: { price },
    });

    return recalculateAfterOverrideChange(
        { productId, contractId, duration, quantity, customerId },
        "Override gespeichert, aber Preis konnte nicht neu berechnet werden.",
    );
}

export async function deleteCustomerPrice(input: DeleteCustomerPriceInput) {
    const { productId, contractId, duration, quantity, customerId } = input;

    const tariff = await loadTariffForPricing(productId, contractId, customerId);
    if (!tariff) throw priceFailure("NO_TARIFF");

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) throw priceFailure(resolved.reason);

    await prisma.tariffCustomerPrice.deleteMany({
        where: {
            tariffId: tariff.id,
            customerId,
            productId,
            duration: resolved.cell.duration,
            min_quantity: resolved.tier.min_quantity,
        },
    });

    return recalculateAfterOverrideChange(
        { productId, contractId, duration, quantity, customerId },
        "Override gelöscht, aber Default-Preis konnte nicht berechnet werden.",
    );
}


/* ========== Standardlaufzeiten ========== */

/**
 * Die global gepflegten Laufzeiten. Sie sind die Spaltenachse aller
 * Preistabellen — im Gegensatz zu {@link getTariffDurations} braucht diese
 * Liste weder Produkt noch Vertrag und steht damit fest, bevor im Angebot
 * eine Position existiert.
 */
export async function getStandardDurations() {
    return prisma.standardDuration.findMany({ orderBy: { months: "asc" } });
}

export async function createStandardDuration(input: CreateStandardDurationInput) {
    const { months } = input;

    const existing = await prisma.standardDuration.findUnique({ where: { months } });

    if (existing) {
        throw new AppException(
            `Die Laufzeit ${months} steht bereits in der Liste.`,
            422,
            "DURATION_ALREADY_EXISTS",
        );
    }

    return prisma.standardDuration.create({ data: { months } });
}

/**
 * Entfernt nur den Listeneintrag. Bereits konfigurierte Tarifspalten und die
 * darin hinterlegten Preise bleiben unangetastet — ein Löschen, das sie
 * mitnimmt, wäre stiller Datenverlust.
 */
export async function deleteStandardDuration(id: string): Promise<void> {
    const existing = await prisma.standardDuration.findUnique({ where: { id } });

    if (!existing) {
        throw new AppException("Laufzeit nicht gefunden.", 404, "DURATION_NOT_FOUND");
    }

    await prisma.standardDuration.delete({ where: { id } });
}
