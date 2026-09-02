import { OfferDerivationType, Prisma, TariffVersionReason } from "@prisma/client";

import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { requestOfferGeneration } from "./document-generation-request.service.js";
import { generateOfferDisplayName } from "../utils/documents.js";
import { pickTranslation } from "../utils/i18n.js";
import { loadTariffForPricing, selectPrice } from "../utils/products.js";
import { toDate } from "../utils/utils.js";
import { assertStandardDuration, sealTariffVersion } from "./tariff.service.js";

import {
    CreateOfferInput,
    CreateOfferPositionInput,
    CreateOfferFlatrateInput,
    ExtendOfferInput,
    PositionPrice,
    UpdateOfferInput,
    OfferFilterParams
} from '@keepit/schemas';

import {
    OFFER_REVISION_SNAPSHOT_VERSION,
    buildOfferRevisionSnapshot,
    parseOfferRevisionSnapshot,
} from "../schemas/revision-schemas.js";
import {
    parseTariffVersionSnapshot,
    tariffFromSnapshot,
} from "../schemas/tariff-version-schema.js";

/* ========== Types ========== */

type PricedPosition = CreateOfferPositionInput & {
    total_cents: number;
    eur_user_month: number;
    discount_cents: number;
    /** Angepinnte, unveränderliche Preisgrundlage dieser Position. */
    tariffVersionId: string | null;
};

/**
 * Vertrag und Laufzeit des Angebots. Sie adressieren zusammen mit Produkt und
 * Menge eine Zelle der Preistabelle — und stehen am Kopf, weil alle Positionen
 * eines Angebots dieselbe Spalte derselben Tabelle treffen.
 */
type PriceHeader = {
    contractId: string;
    duration_months: number;
};
type PricedFlatrate = CreateOfferFlatrateInput & { total_cents: number };
type PricedDiscount = {
    title: string;
    description?: string | null;
    amount_cents: number;
};

/* ========== Helpers ========== */

/**
 * Berechnet total_cents für jede Position über den Tarif (wirft AppException,
 * wenn kein Preis ermittelbar).
 *
 * Dabei wird der verwendete Tarifstand als unveränderliche `TariffVersion`
 * versiegelt und an der Position angepinnt. Der Hash-Vergleich in
 * {@link sealTariffVersion} sorgt dafür, dass unveränderte Tabellen keine neue
 * Version erzeugen — es entsteht genau eine Version je tatsächlich verkaufter
 * Konfiguration.
 */
async function pricePositions(
    positions: CreateOfferPositionInput[],
    header: PriceHeader,
    customerId: string | undefined,
    actorId: string | null,
): Promise<PricedPosition[]> {
    const priced: PricedPosition[] = [];

    for (const position of positions) {
        try {
            const tariff = await loadTariffForPricing(position.productId, header.contractId, customerId);

            if (!tariff) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: NO_TARIFF`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const result = selectPrice(tariff, {
                productId: position.productId,
                duration: header.duration_months,
                quantity: position.quantity,
                customerId,
            });

            if (!result.ok) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: ${result.reason}`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const version = await sealTariffVersion(tariff.id, TariffVersionReason.OFFER, actorId);

            const eur_user_month = result.breakdown.unitPrice;
            const discount_cents = eur_user_month * position.quantity * (position.free_months ?? 0);

            priced.push({
                ...position,
                total_cents: result.price,
                eur_user_month,
                discount_cents,
                tariffVersionId: version.id,
            });
        } catch (exception: any) {
            if (exception instanceof AppException) throw exception;
            throw new AppException(
                `Price calculation failed for product ${position.productId}: ${exception.message}`,
                422,
                "PRICE_CALCULATION_FAILED",
            );
        }
    }

    return priced;
}

/** Lädt die total_cents aller angefragten FlatRates als Map (id → cents). */
async function getFlatRateCentsById(flatRateIds: string[]): Promise<Map<string, number>> {
    const rates = await prisma.flatRate.findMany({
        where: { id: { in: flatRateIds } },
        select: { id: true, total_cents: true },
    });

    return new Map(rates.map((r) => [r.id, r.total_cents]));
}

/** Berechnet total_cents (= rate * quantity) für jede Flatrate. */
async function priceFlatrates(flatrates: CreateOfferFlatrateInput[]): Promise<PricedFlatrate[]> {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId));

    return flatrates.map((flatrate) => {
        const rate_cents = rateById.get(flatrate.flatRateId);
        if (rate_cents === undefined) {
            throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
        }

        return { ...flatrate, total_cents: rate_cents * flatrate.quantity };
    });
}

/** Mapped die Scalar-Felder eines Offers auf Prisma-Datentypen (Datumsfelder, nullables). */
function mapOfferData<T extends { supplierId?: string | null; validUntil?: string | null; requestFrom?: string | null; date?: string | null }>(fields: T) {
    const { supplierId, validUntil, requestFrom, date, ...rest } = fields;

    return {
        ...rest,
        date: toDate(date) ?? new Date(),
        supplierId: supplierId || null,
        validUntil: toDate(validUntil),
        requestFrom: toDate(requestFrom),
    };
}

/** Summiert Positionen + Flatrates neu und schreibt net_amount am Offer. */
async function recomputeNetAmount(tx: Prisma.TransactionClient, offerId: string): Promise<void> {
    const [positionsSum, positionsDiscountSum, flatratesSum, discountsSum] = await Promise.all([
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { discount_cents: true },
        }),
        tx.offerFlatRate.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
        tx.offerDiscount.aggregate({
            where: { offerId },
            _sum: { amount_cents: true },
        }),
    ]);

    const positionsNet = (positionsSum._sum.total_cents ?? 0) - (positionsDiscountSum._sum.discount_cents ?? 0);
    const discountsNet = discountsSum._sum.amount_cents ?? 0;

    await tx.offer.update({
        where: { id: offerId },
        data: {
            net_amount: positionsNet + (flatratesSum._sum.total_cents ?? 0) - discountsNet,
        },
    });
}

async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: PricedPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
            offerId, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
            tariffVersionId: tariffVersionId ?? null,
        })),
    });
}

async function replaceFlatRates(tx: Prisma.TransactionClient, offerId: string, flatRates: PricedFlatrate[]) {
    await tx.offerFlatRate.deleteMany({ where: { offerId } });
    await tx.offerFlatRate.createMany({
        data: flatRates.map(({ flatRateId, quantity, total_cents }) => ({
            offerId, flatRateId, quantity, total_cents,
        })),
    });
}

async function replaceDiscounts(tx: Prisma.TransactionClient, offerId: string, discounts: ReadonlyArray<PricedDiscount>) {
    await tx.offerDiscount.deleteMany({ where: { offerId } });
    if (discounts.length === 0) return;

    await tx.offerDiscount.createMany({
        data: discounts.map(({ title, description, amount_cents }) => ({
            offerId, title, description: description ?? null, amount_cents,
        })),
    });
}

function sumDiscounts(discounts: ReadonlyArray<PricedDiscount>): number {
    return discounts.reduce((sum, d) => sum + d.amount_cents, 0);
}

/* ========== Queries ========== */

export async function getOffers(query: OfferFilterParams) {
    const { search, companyIds, contactPersonIds, productIds, sort, cursor } = query;

    const limitRaw = Number(query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.trunc(limitRaw), 100)
        : 50;

    const where: {
        quoteId?: { contains: string };
        customerId?: { in: string[] };
        contactPersonId?: { in: string[] };
        offerPositions?: { some: { productId: { in: string[] } } };
    } = {};

    if (search && typeof search === "string") {
        where.quoteId = { contains: search };
    }

    if (companyIds) {
        const ids = Array.isArray(companyIds) ? companyIds : [companyIds];
        where.customerId = { in: ids as string[] };
    }

    if (contactPersonIds) {
        const ids = Array.isArray(contactPersonIds) ? contactPersonIds : [contactPersonIds];
        where.contactPersonId = { in: ids as string[] };
    }

    if (productIds) {
        const ids = Array.isArray(productIds) ? productIds : [productIds];
        where.offerPositions = { some: { productId: { in: ids as string[] } } };
    }

    const orderBy = sort === "createdAt:asc" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

    const items = await prisma.offer.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor && typeof cursor === "string" ? { id: cursor } : undefined,
        include: {
            user: true,
            supplier: true,
            contract: { include: { translations: true } },
            customer: { select: { id: true, companyName: true } },
            customerContactPerson: { select: { id: true, salutation: true, firstName: true, lastName: true } },
            offerDocuments: {
                where: { deletedAt: null },
                include: {
                    artifacts: true,
                }
            },
            offerPositions: {
                include: {
                    product: {
                        include: { translations: true }
                    }
                }
            },
            offerFlatRates: {
                include: {
                    flatRate: {
                        include: { translations: true }
                    }
                }
            },
            offerDiscounts: true,
        },
    });

    const nextCursor = items.length === limit ? items[items.length - 1]?.id ?? null : null;

    return { items, nextCursor };
}

export async function getOfferById(id: string) {
    const offer = await prisma.offer.findFirst({
        where: { id },
        include: {
            user: true,
            supplier: true,
            contract: { include: { translations: true } },
            customer: true,
            customerContactPerson: true,
            offerDocuments: {
                where: { deletedAt: null },
                orderBy: { version: "desc" as const },
                include: {
                    artifacts: true,
                    task: true,
                },
            },
            offerPositions: {
                include: {
                    product: {
                        include: { translations: true }
                    }
                }
            },
            offerFlatRates: true,
            offerDiscounts: true,
        },
    });

    if (!offer) {
        throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
    }

    return offer;
}

export async function getOfferRevisions(offerId: string) {
    const exists = await prisma.offer.findUnique({ where: { id: offerId }, select: { id: true } });
    if (!exists) {
        throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
    }

    return prisma.offerRevision.findMany({
        where: { offerId },
        orderBy: { version: "desc" },
        select: {
            id: true,
            version: true,
            createdAt: true,
            changedBy: { select: { id: true, name: true } },
        },
    });
}

export async function getNextQuoteId(): Promise<number> {
    const quoteId = 0; //await getLatestQuoteId();
    return quoteId + 1;
}

/* ========== Mutations ========== */

/** Skalarfelder eines Angebots — alles ausser Positionen, Flatrates und Rabatten. */
type OfferFields = PriceHeader & {
    customerId: string;
    contactPersonId: string;
    userId: string;
    supplierId: string | null;
    quoteId: string;
    paymentTerm: string;
    language: "DE" | "EN";
    validUntil: string | null;
    requestFrom: string | null;
    featureComparison: boolean;
    toCompare: string[];
};

/**
 * Schreibt ein Angebot mit bereits bepreisten Bestandteilen.
 *
 * Bewusst von der Preisermittlung getrennt: `createOffer` bepreist über den
 * Live-Tarif, `extendOffer` über die angepinnte Tarif-Version — die Persistenz
 * inklusive `net_amount`-Formel ist für beide dieselbe.
 */
async function persistOffer(
    fields: OfferFields,
    positions: PricedPosition[],
    flatrates: PricedFlatrate[],
    discounts: ReadonlyArray<PricedDiscount>,
    options?: { renewedFromOfferId?: string; derivationType?: OfferDerivationType },
) {
    return prisma.$transaction(async (tx) => {
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
            sumDiscounts(discounts);

        const offer = await tx.offer.create({
            data: {
                ...fields,
                net_amount,
                renewedFromOfferId: options?.renewedFromOfferId ?? null,
                derivationType: options?.derivationType ?? null,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
                offerId: offer.id, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
                tariffVersionId,
            })),
        });

        if (flatrates.length > 0) {
            await tx.offerFlatRate.createMany({
                data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                    offerId: offer.id, flatRateId, quantity, total_cents,
                })),
            });
        }

        await replaceDiscounts(tx, offer.id, discounts);

        return offer;
    });
}

export async function createOffer(
    input: CreateOfferInput,
    options?: { renewedFromOfferId?: string; derivationType?: OfferDerivationType; actorId?: string | null },
) {
    await assertStandardDuration(input.duration_months);

    const header = { contractId: input.contractId, duration_months: input.duration_months };

    const positions = await pricePositions(input.offerPositions, header, input.customerId, options?.actorId ?? null);
    const flatrates = await priceFlatrates(input.flatrates);

    return persistOffer(
        {
            ...header,
            customerId: input.customerId,
            contactPersonId: input.contactPersonId,
            userId: input.userId,
            supplierId: input.supplierId,
            quoteId: input.quoteId,
            paymentTerm: input.paymentTerm,
            language: input.language,
            validUntil: input.validUntil,
            requestFrom: input.requestFrom,
            featureComparison: input.featureComparison,
            toCompare: input.toCompare,
        },
        positions,
        flatrates,
        input.discounts,
        { renewedFromOfferId: options?.renewedFromOfferId, derivationType: options?.derivationType },
    );
}

export async function updateOffer(offerId: string, input: UpdateOfferInput, actorId: string) {
    const { offerPositions: rawPositions, flatrates: rawFlatrates, discounts, expectedVersion } = input;

    await assertStandardDuration(input.duration_months);

    const header = { contractId: input.contractId, duration_months: input.duration_months };

    const positions = await pricePositions(rawPositions, header, input.customerId, actorId);
    const flatrates = await priceFlatrates(rawFlatrates);

    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${offerId}`}))::text AS "lock"`;

        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
            sumDiscounts(discounts);

        const current = await tx.offer.findFirstOrThrow({
            where: { id: offerId },
            include: {
                offerPositions: true,
                offerFlatRates: true,
                offerDiscounts: true,
            },
        });

        if (current.version !== expectedVersion) {
            throw new AppException(
                "The offer was changed by another user. Reload it and try again.",
                409,
                "VERSION_CONFLICT",
            );
        }

        const snapshot = buildOfferRevisionSnapshot(current as unknown as Record<string, unknown>);

        await tx.offerRevision.create({
            data: {
                offerId,
                version: current.version,
                changedById: actorId,
                snapshotVersion: OFFER_REVISION_SNAPSHOT_VERSION,
                snapshot: snapshot as Prisma.InputJsonValue,
            },
        });

        const [offer] = await tx.offer.updateManyAndReturn({
            where: { id: offerId },
            data: {
                ...header,
                customerId: input.customerId,
                contactPersonId: input.contactPersonId,
                userId: input.userId,
                quoteId: input.quoteId,
                language: input.language,
                supplierId: input.supplierId,
                paymentTerm: input.paymentTerm,
                validUntil: input.validUntil,
                requestFrom: input.requestFrom,
                featureComparison: input.featureComparison,
                toCompare: input.toCompare,
                net_amount,
                version: { increment: 1 },
            },
        });

        await replacePositions(tx, offerId, positions);
        await replaceFlatRates(tx, offerId, flatrates);
        await replaceDiscounts(tx, offerId, discounts);

        await tx.offerDocument.updateMany({
            where: { offerId, isCurrent: true },
            data: { isCurrent: false },
        });

        return offer;
    });
}

export async function restoreOfferRevision(
    offerId: string,
    revisionId: string,
    expectedVersion: number,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${offerId}`}))::text AS "lock"`;

        const current = await tx.offer.findUnique({
            where: { id: offerId },
            include: { offerPositions: true, offerFlatRates: true, offerDiscounts: true },
        });
        if (!current) {
            throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
        }
        if (current.version !== expectedVersion) {
            throw new AppException(
                "The offer was changed by another user. Reload it and try again.",
                409,
                "VERSION_CONFLICT",
            );
        }

        const revision = await tx.offerRevision.findFirst({
            where: { id: revisionId, offerId },
            select: { snapshot: true, snapshotVersion: true },
        });
        if (!revision) {
            throw new AppException("Offer revision not found!", 404, "OFFER_REVISION_NOT_FOUND");
        }
        // Version 1 bleibt lesbar: dort hingen Vertrag und Laufzeit an der
        // Position und werden beim Lesen an den Kopf gehoben. Ohne das waeren
        // alle vor dieser Umstellung entstandenen Revisionen unwiederherstellbar.
        if (revision.snapshotVersion > OFFER_REVISION_SNAPSHOT_VERSION) {
            throw new AppException(
                `Offer revision snapshot version ${revision.snapshotVersion} is not supported.`,
                422,
                "UNSUPPORTED_REVISION_SNAPSHOT_VERSION",
            );
        }

        let restored;

        try {
            restored = parseOfferRevisionSnapshot(revision.snapshot, revision.snapshotVersion);
        } catch {
            throw new AppException(
                "The stored offer revision is invalid and cannot be restored.",
                422,
                "INVALID_REVISION_SNAPSHOT",
            );
        }

        const currentSnapshot = buildOfferRevisionSnapshot(current as unknown as Record<string, unknown>);
        await tx.offerRevision.create({
            data: {
                offerId,
                version: current.version,
                changedById: actorId,
                snapshotVersion: OFFER_REVISION_SNAPSHOT_VERSION,
                snapshot: currentSnapshot as Prisma.InputJsonValue,
            },
        });

        const offer = await tx.offer.update({
            where: { id: offerId },
            data: {
                ...restored.offer,
                date: new Date(restored.offer.date),
                validUntil: restored.offer.validUntil ? new Date(restored.offer.validUntil) : null,
                requestFrom: restored.offer.requestFrom ? new Date(restored.offer.requestFrom) : null,
                version: { increment: 1 },
            },
        });

        await replacePositions(tx, offerId, restored.positions);
        await replaceFlatRates(tx, offerId, restored.flatRates);
        await replaceDiscounts(tx, offerId, restored.discounts);

        await tx.offerDocument.updateMany({
            where: { offerId, isCurrent: true },
            data: { isCurrent: false },
        });

        return offer;
    });
}

export async function createOfferPositions(
    offerId: string,
    positions: CreateOfferPositionInput[],
    actorId: string | null,
) {
    // Kunde, Vertrag und Laufzeit stammen aus dem Angebot — der Kunde, weil
    // sonst kundenspezifische Preise auf diesem Pfad stillschweigend ignoriert
    // würden; Vertrag und Laufzeit, weil sie eine Eigenschaft des Angebots sind
    // und eine neue Position sie nicht mitbringen kann.
    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        select: { customerId: true, contractId: true, duration_months: true },
    });

    if (!offer) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const priced = await pricePositions(
        positions,
        { contractId: offer.contractId, duration_months: offer.duration_months },
        offer.customerId,
        actorId,
    );

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.offerPosition.createManyAndReturn({
            data: priced.map((position) => ({ offerId, ...position })),
        });

        await recomputeNetAmount(tx, offerId);

        return created;
    });
}

export async function createOfferFlatrates(offerId: string, flatrates: CreateOfferFlatrateInput[]) {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId));

    return prisma.$transaction(async (tx) => {
        const created = await tx.offerFlatRate.createManyAndReturn({
            data: flatrates.map((flatrate) => {
                const rate_cents = rateById.get(flatrate.flatRateId);
                if (rate_cents === undefined) {
                    throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
                }

                return {
                    offerId,
                    ...flatrate,
                    total_cents: rate_cents,
                };
            }),
        });

        await recomputeNetAmount(tx, offerId);

        return created;
    });
}

/* ========== Documents ========== */

export async function enqueueGeneration(offerId: string) {
    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: {
            customer: true,
            offerPositions: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    }
                }
            }
        }
    });

    const formatedWorkloads = offer.offerPositions.map((op) => (
        pickTranslation(op.product.translations, offer.language)?.name ?? ""
    ).replaceAll(" ", "").trim());

    return requestOfferGeneration(offerId, (version) => generateOfferDisplayName(
        offer.quoteId,
        offer.customer.companyName,
        formatedWorkloads,
        version,
    ));
}

/* ========== Deletes ========== */

export async function deleteOffer(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-generation:${id}`}))::text AS "lock"`;

        await tx.offer.findUniqueOrThrow({ where: { id } });

        if (await tx.offerDocument.count({ where: { offerId: id } }) > 0) {
            throw new AppException(
                "Offers with document history cannot be deleted.",
                409,
                "OFFER_HAS_DOCUMENT_HISTORY",
            );
        }

        await tx.offer.delete({ where: { id } });
    });
}

/* ========== Abgeleitete Angebote ========== */

export async function renewOffer(sourceOfferId: string, input: CreateOfferInput, actorId: string | null) {
    const source = await prisma.offer.findUnique({
        where: { id: sourceOfferId },
        select: { id: true },
    });
    if (!source) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    return createOffer(input, {
        renewedFromOfferId: sourceOfferId,
        derivationType: OfferDerivationType.RENEWAL,
        actorId,
    });
}

/**
 * Quellposition in der Form, die {@link priceFromPin} benötigt.
 *
 * Die Laufzeit steht nicht mehr an der Position, sondern am Quellangebot —
 * sie wird deshalb getrennt hereingereicht.
 */
type SourcePosition = {
    id: string;
    productId: string;
    free_months: number;
    eur_user_month: number;
    tariffVersionId: string | null;
};

/**
 * Ermittelt den Preis einer Erweiterungsposition aus der Tarif-Version, die die
 * Quellposition angepinnt hat. Dadurch gilt der Preis von damals, obwohl der
 * Live-Tarif inzwischen ein anderer sein kann — und weil die volle Preistabelle
 * eingefroren ist, greift auch bei geänderter Menge die richtige Staffel.
 *
 * Kundenspezifische Preise werden bewusst **aktuell** gelesen: Sie haben keine
 * Historie, ein ausgehandelter Sonderpreis gilt also in seiner heutigen Fassung.
 *
 * Ohne Pin (Positionen aus der Zeit vor der Tarif-Versionierung) bleibt nur der
 * flache Rückfall auf den gespeicherten Stückpreis — Mengenstaffeln lassen sich
 * dann nicht berücksichtigen, was `fromSnapshot: false` nach aussen meldet. Ob
 * jener Betrag damals ein Kundenpreis war, ist an der Position nicht vermerkt;
 * er wird deshalb als `list` ohne Vergleichswert gemeldet.
 */
async function priceFromPin(
    source: SourcePosition,
    duration: number,
    quantity: number,
    customerId: string,
) {
    const flat = (eur_user_month: number, fromSnapshot: boolean) => ({
        eur_user_month,
        total_cents: eur_user_month * quantity * duration,
        discount_cents: eur_user_month * quantity * source.free_months,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot,
        origin: "list" as const,
        list_eur_user_month: null,
    });

    if (!source.tariffVersionId) {
        return flat(source.eur_user_month, false);
    }

    const version = await prisma.tariffVersion.findUnique({
        where: { id: source.tariffVersionId },
        select: { tariffId: true, snapshot: true, snapshotVersion: true },
    });

    if (!version) {
        throw new AppException("Tariff version not found", 404, "TARIFF_VERSION_NOT_FOUND");
    }

    if (version.snapshotVersion !== 1) {
        throw new AppException(
            `Snapshot-Version ${version.snapshotVersion} wird nicht unterstützt.`,
            422,
            "UNSUPPORTED_SNAPSHOT_VERSION",
        );
    }

    const customerPrices = await prisma.tariffCustomerPrice.findMany({
        where: { tariffId: version.tariffId, customerId },
    });

    const tariff = tariffFromSnapshot(parseTariffVersionSnapshot(version.snapshot), customerPrices);

    const result = selectPrice(tariff, {
        productId: source.productId,
        duration,
        quantity,
        customerId,
    });

    if (!result.ok) {
        throw new AppException(
            `Price calculation failed for product ${source.productId}: ${result.reason}`,
            422,
            "PRICE_CALCULATION_FAILED",
        );
    }

    const eur_user_month = result.breakdown.unitPrice;

    return {
        eur_user_month,
        total_cents: result.price,
        discount_cents: eur_user_month * quantity * source.free_months,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot: true,
        // Der Kundenpreis wird aktuell gelesen, nicht aus dem Snapshot — die
        // Herkunft gilt also für heute und ist deshalb aussagekräftig.
        origin: result.breakdown.origin,
        list_eur_user_month: result.breakdown.listUnitPrice,
    };
}

/** Lädt eine Quellposition und stellt sicher, dass sie zum Angebot gehört. */
async function loadSourcePosition(offerId: string, positionId: string) {
    const position = await prisma.offerPosition.findUnique({
        where: { id: positionId },
        select: {
            id: true, offerId: true, productId: true,
            free_months: true, eur_user_month: true, tariffVersionId: true,
        },
    });

    if (!position || position.offerId !== offerId) {
        throw new AppException("Offer position not found", 422, "OFFER_POSITION_NOT_FOUND");
    }

    return position;
}

/** Preis-Vorschau für eine einzelne Erweiterungsposition (Anzeige im Modal). */
export async function getExtensionPrice(
    offerId: string,
    positionId: string,
    quantity: number,
): Promise<PositionPrice> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppException("quantity muss eine positive Ganzzahl sein.", 400, "INVALID_INPUT");
    }

    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        select: { customerId: true, duration_months: true },
    });

    if (!offer) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const source = await loadSourcePosition(offerId, positionId);
    const { eur_user_month, total_cents, discount_cents, fromSnapshot, origin, list_eur_user_month } =
        await priceFromPin(source, offer.duration_months, quantity, offer.customerId);

    return { eur_user_month, total_cents, discount_cents, fromSnapshot, origin, list_eur_user_month };
}

/**
 * Erzeugt eine Lizenzerweiterung: zusätzliche Seats innerhalb eines laufenden
 * Vertrags, abgerechnet zu den Konditionen des Quellangebots.
 *
 * Produkt, Vertrag und Laufzeit stammen unverändert aus der Quellposition, nur
 * die Menge darf abweichen. Flatrates entfallen bewusst — sie sind vertragsweite
 * Pauschalen und wären in einer Nachbestellung eine Doppelfakturierung.
 */
export async function extendOffer(sourceOfferId: string, input: ExtendOfferInput, actorId: string | null) {
    const source = await prisma.offer.findUnique({
        where: { id: sourceOfferId },
        include: { offerPositions: true },
    });

    if (!source) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const sourceById = new Map(source.offerPositions.map((position) => [position.id, position]));
    const positions: PricedPosition[] = [];

    for (const requested of input.positions) {
        const sourcePosition = sourceById.get(requested.sourcePositionId);

        if (!sourcePosition) {
            throw new AppException(
                `Position ${requested.sourcePositionId} gehört nicht zum Quellangebot.`,
                422,
                "OFFER_POSITION_NOT_FOUND",
            );
        }

        const priced = await priceFromPin(
            sourcePosition, source.duration_months, requested.quantity, source.customerId,
        );

        positions.push({
            productId: sourcePosition.productId,
            free_months: sourcePosition.free_months,
            quantity: requested.quantity,
            optional: sourcePosition.optional,
            total_cents: priced.total_cents,
            eur_user_month: priced.eur_user_month,
            discount_cents: priced.discount_cents,
            // Der Pin wird weitergereicht, damit auch die Erweiterung einer
            // Erweiterung noch auf derselben Preisgrundlage steht.
            tariffVersionId: priced.tariffVersionId,
        });
    }

    return persistOffer(
        {
            // Vertrag und Laufzeit werden unveraendert uebernommen: eine
            // Erweiterung laeuft innerhalb des bestehenden Vertrags. Sie wird
            // bewusst *nicht* gegen die Standardlaufzeiten geprueft — sonst
            // liessen sich laufende Vertraege nicht mehr erweitern, sobald ihre
            // Laufzeit aus der Liste genommen wird.
            contractId: source.contractId,
            duration_months: source.duration_months,
            customerId: source.customerId,
            contactPersonId: source.contactPersonId,
            userId: source.userId,
            supplierId: source.supplierId,
            quoteId: input.quoteId,
            paymentTerm: source.paymentTerm,
            language: source.language,
            validUntil: input.validUntil,
            requestFrom: input.requestFrom,
            featureComparison: source.featureComparison,
            toCompare: source.toCompare,
        },
        positions,
        [],
        input.discounts,
        {
            renewedFromOfferId: sourceOfferId,
            derivationType: OfferDerivationType.LICENSE_EXTENSION,
        },
    );
}
