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
    CreateTariffColumnInput,
    UpdateTariffColumnInput,
    CreateTariffGroupInput,
    UpdateTariffGroupInput,
    CreateTariffRowInput,
    UpdateTariffRowInput,
    UpdateTariffCellInput,
    UpsertCustomerPriceInput,
    DeleteCustomerPriceInput,
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
            }
        }
    },
    rows: {
        orderBy: { min_quantity: 'asc' },
    },
    columns: {
        orderBy: { duration: 'asc' },
    },
    cells: {
        orderBy: { createdAt: 'asc' },
        include: {
            default_cells: true,
        }
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
            rows: {
                orderBy: { min_quantity: 'asc' },
            },
            columns: {
                orderBy: { duration: 'asc' },
            },
            cells: {
                orderBy: { createdAt: 'asc' },
                include: {
                    default_cells: true,
                },
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
    rows: { orderBy: { min_quantity: 'asc' } },
    columns: { orderBy: { duration: 'asc' } },
    cells: { include: { default_cells: true } },
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

    const snapshot = buildTariffVersionSnapshot(tariff);
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
    NO_CELL: { status: 404, message: "Keine Zelle für die gewählte Zeile/Spalte konfiguriert." },
    NO_DEFAULT: { status: 404, message: "Kein Default-Preis für die Zelle hinterlegt." },
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

    const currentHash = hashTariffSnapshot(buildTariffVersionSnapshot(tariff));

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

export async function getTariffDurations(productId: string, contractId: string): Promise<number[]> {
    const groupProduct = await prisma.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return [];

    const tariff = await prisma.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId: groupProduct.tariffGroupId, contractId } },
        select: { columns: { select: { duration: true }, orderBy: { createdAt: 'asc' } } },
    });

    if (!tariff) return [];
    return tariff.columns.map(c => c.duration);
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

        // Cascade über Row/Column würde die Zellen ohnehin mitnehmen; explizit
        // zuerst löschen, damit die Reihenfolge unabhängig vom Schema stimmt.
        await tx.tariffCell.deleteMany({ where: { tariffId } });
        await tx.tariffRow.deleteMany({ where: { tariffId } });
        await tx.tariffColumn.deleteMany({ where: { tariffId } });

        const columns = await tx.tariffColumn.createManyAndReturn({
            data: snapshot.columns.map((column) => ({ tariffId, duration: column.duration })),
            select: { id: true, duration: true },
        });

        const rows = await tx.tariffRow.createManyAndReturn({
            data: snapshot.rows.map((row) => ({
                tariffId, min_quantity: row.min_quantity, max_quantity: row.max_quantity,
            })),
            select: { id: true, min_quantity: true },
        });

        const columnIdByDuration = new Map(columns.map((column) => [column.duration, column.id]));
        const rowIdByMinQuantity = new Map(rows.map((row) => [row.min_quantity, row.id]));

        const cells = snapshot.cells.flatMap((cell) => {
            const columnId = columnIdByDuration.get(cell.duration);
            const rowId = rowIdByMinQuantity.get(cell.min_quantity);
            if (!columnId || !rowId) return [];

            return [{ tariffId, rowId, columnId, price: cell.price }];
        });

        const createdCells = await tx.tariffCell.createManyAndReturn({
            data: cells.map(({ rowId, columnId }) => ({ tariffId, rowId, columnId })),
            select: { id: true, rowId: true, columnId: true },
        });

        const priceByCoordinate = new Map(cells.map((cell) => [`${cell.rowId}:${cell.columnId}`, cell.price]));

        // Zellen ohne Default-Preis im Snapshot bleiben bewusst unkonfiguriert,
        // damit selectPrice sie als NO_DEFAULT meldet statt still zu rechnen.
        const defaults = createdCells.flatMap((cell) => {
            const price = priceByCoordinate.get(`${cell.rowId}:${cell.columnId}`);
            return price == null ? [] : [{ cellId: cell.id, price }];
        });

        if (defaults.length > 0) {
            await tx.tariffCellDefault.createMany({ data: defaults });
        }

        return tx.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: TARIFF_INCLUDE,
        });
    });
}

export async function createTariffColumn(tariffId: string, input: CreateTariffColumnInput) {
    const { duration } = input;

    const tariff = await prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: {
            rows: true,
            columns: { select: { duration: true } },
        }
    });

    if (tariff.columns.some((column) => column.duration === duration)) {
        throw new AppException(
            `Für die Laufzeit ${duration} existiert bereits eine Spalte.`,
            422,
            "DURATION_ALREADY_EXISTS",
        );
    }

    await prisma.$transaction(async (tx) => {
        const col = await tx.tariffColumn.create({
            data: { tariffId, duration },
        });

        // Zellen entstehen ohne Default-Preis — ein vorbelegter Preis würde
        // eine unkonfigurierte Zelle als gültig erscheinen lassen.
        await tx.tariffCell.createMany({
            data: tariff.rows.map((row) => ({
                tariffId,
                rowId: row.id,
                columnId: col.id,
            })),
        });
    });

    return prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });
}

export async function updateTariffColumn(columnId: string, input: UpdateTariffColumnInput) {
    const { duration } = input;

    if (duration === undefined) {
        return prisma.tariffColumn.findUniqueOrThrow({ where: { id: columnId } });
    }

    return prisma.$transaction(async (tx) => {
        const current = await tx.tariffColumn.findUnique({
            where: { id: columnId },
            select: { id: true, tariffId: true, duration: true },
        });

        if (!current) {
            throw new AppException("Tariff column not found.", 404, "NO_COLUMN");
        }

        const duplicate = await tx.tariffColumn.findFirst({
            where: { tariffId: current.tariffId, duration, id: { not: columnId } },
        });

        if (duplicate) {
            throw new AppException(
                `Für die Laufzeit ${duration} existiert bereits eine Spalte.`,
                422,
                "DURATION_ALREADY_EXISTS",
            );
        }

        await moveCustomerPricesToDuration(tx, current.tariffId, current.duration, duration);

        return tx.tariffColumn.update({
            where: { id: columnId },
            data: { duration },
        });
    });
}

export async function deleteTariffColumn(columnId: string) {
    return prisma.$transaction(async (tx) => {
        const column = await tx.tariffColumn.delete({ where: { id: columnId } });

        // Mit der Spalte verschwinden die Kundenpreise auf ihrer Laufzeit —
        // sonst leben sie als Waisen weiter und greifen wieder, sobald jemand
        // dieselbe Laufzeit erneut anlegt.
        await tx.tariffCustomerPrice.deleteMany({
            where: { tariffId: column.tariffId, duration: column.duration },
        });

        return column;
    });
}

export async function createTariffRow(tariffId: string, input: CreateTariffRowInput) {
    const { min_quantity, max_quantity } = input;

    const tariff = await prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: {
            columns: true,
            rows: { select: { id: true, min_quantity: true, max_quantity: true } },
        }
    });

    assertQuantityRange({ min_quantity, max_quantity });
    assertNoOverlap(tariff.rows, { min_quantity, max_quantity });

    await prisma.$transaction(async (tx) => {
        const r = await tx.tariffRow.create({
            data: { tariffId, min_quantity, max_quantity },
        });

        // Zellen entstehen ohne Default-Preis — siehe createTariffColumn.
        await tx.tariffCell.createMany({
            data: tariff.columns.map((column) => ({
                tariffId,
                rowId: r.id,
                columnId: column.id,
            })),
        });
    });

    return prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });
}

export async function updateTariffRow(rowId: string, input: UpdateTariffRowInput) {
    const { min_quantity, max_quantity } = input;

    return prisma.$transaction(async (tx) => {
        const current = await tx.tariffRow.findUnique({
            where: { id: rowId },
            select: { id: true, tariffId: true, min_quantity: true, max_quantity: true },
        });

        if (!current) {
            throw new AppException("Tariff row not found.", 404, "NO_ROW");
        }

        const next: QuantityRange = {
            min_quantity: min_quantity ?? current.min_quantity,
            max_quantity: max_quantity !== undefined ? max_quantity : current.max_quantity,
        };

        assertQuantityRange(next);

        const siblings = await tx.tariffRow.findMany({
            where: { tariffId: current.tariffId },
            select: { id: true, min_quantity: true, max_quantity: true },
        });

        assertNoOverlap(siblings, next, rowId);

        await moveCustomerPricesToMinQuantity(
            tx, current.tariffId, current.min_quantity, next.min_quantity,
        );

        return tx.tariffRow.update({
            where: { id: rowId },
            data: next,
        });
    });
}

export async function deleteTariffRow(rowId: string) {
    return prisma.$transaction(async (tx) => {
        const row = await tx.tariffRow.delete({ where: { id: rowId } });

        // Siehe deleteTariffColumn: ohne dieses Aufräumen bleibt der
        // Kundenpreis liegen und wacht bei derselben Mengenuntergrenze wieder auf.
        await tx.tariffCustomerPrice.deleteMany({
            where: { tariffId: row.tariffId, min_quantity: row.min_quantity },
        });

        return row;
    });
}

/**
 * Setzt den Listenpreis einer Zelle.
 *
 * Muss ein Upsert sein: Zellen entstehen ohne `TariffCellDefault`, ein reines
 * Update würde null Zeilen treffen und stillschweigend nichts tun.
 */
export async function updateTariffCell(cellId: string, input: UpdateTariffCellInput) {
    return prisma.tariffCellDefault.upsert({
        where: { cellId },
        create: { cellId, price: input.default_price },
        update: { price: input.default_price },
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
                duration: resolved.column.duration,
                min_quantity: resolved.row.min_quantity,
            },
        },
        create: {
            tariffId: tariff.id,
            customerId,
            productId,
            duration: resolved.column.duration,
            min_quantity: resolved.row.min_quantity,
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
            duration: resolved.column.duration,
            min_quantity: resolved.row.min_quantity,
        },
    });

    return recalculateAfterOverrideChange(
        { productId, contractId, duration, quantity, customerId },
        "Override gelöscht, aber Default-Preis konnte nicht berechnet werden.",
    );
}
