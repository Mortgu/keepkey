import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { requestOfferGeneration } from "./document-generation-request.service.js";
import { generateOfferDisplayName } from "../utils/documents.js";
import { pickTranslation } from "../utils/i18n.js";
import { calculatePrice } from "../utils/products.js";
import { toDate } from "../utils/utils.js";

import {
    CreateOfferInput,
    CreateOfferPositionInput,
    CreateOfferFlatrateInput,
    UpdateOfferInput
} from '@keepit/schemas';

import {
    buildOfferRevisionSnapshot,
    parseOfferRevisionSnapshot,
} from "../schemas/revision-schemas.js";

/* ========== Types ========== */

type PricedPosition = CreateOfferPositionInput & {
    total_cents: number;
    eur_user_month: number;
    discount_cents: number;
};
type StoredPosition = Omit<PricedPosition, "optional"> & { optional?: boolean | null };
type PricedFlatrate = CreateOfferFlatrateInput & { total_cents: number };
type PricedDiscount = {
    title: string;
    description?: string | null;
    amount_cents: number;
};

export interface OfferListQuery {
    search?: unknown;
    companyIds?: unknown;
    contactPersonIds?: unknown;
    productIds?: unknown;
    sort?: unknown;
    cursor?: unknown;
    limit?: unknown;
}

/* ========== Helpers ========== */

/** Berechnet total_cents für jede Position über den Tarif (wirft AppException, wenn kein Preis ermittelbar). */
async function pricePositions(positions: CreateOfferPositionInput[], customerId?: string): Promise<PricedPosition[]> {
    const priced: PricedPosition[] = [];

    for (const position of positions) {
        try {
            const result = await calculatePrice({
                productId: position.productId,
                contractId: position.contractId,
                duration: position.duration_months,
                quantity: position.quantity,
                customerId,
                freeMonths: 0,
            });

            if (!result.ok) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: ${result.reason}`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const eur_user_month = result.breakdown.unitPrice;
            const discount_cents = eur_user_month * position.quantity * (position.free_months ?? 0);

            priced.push({ ...position, total_cents: result.price, eur_user_month, discount_cents });
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

async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: StoredPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, contractId, duration_months, free_months, quantity, optional, eur_user_month, total_cents, discount_cents }) => ({
            offerId, productId, contractId, duration_months, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
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

export async function getOffers(query: OfferListQuery) {
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
                    },
                    contract: {
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
                    },
                    contract: {
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

export async function createOffer(input: CreateOfferInput) {
    const positions = await pricePositions(input.offerPositions, input.customerId);
    const flatrates = await priceFlatrates(input.flatrates);
    const discounts = input.discounts;

    return prisma.$transaction(async (tx) => {
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
            sumDiscounts(discounts);

        const offer = await tx.offer.create({
            data: {
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
                net_amount: net_amount,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, contractId, duration_months, free_months, quantity, optional, eur_user_month, total_cents, discount_cents }) => ({
                offerId: offer.id, productId, contractId, duration_months, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
            })),
        });

        await tx.offerFlatRate.createMany({
            data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                offerId: offer.id, flatRateId, quantity, total_cents,
            })),
        });

        await replaceDiscounts(tx, offer.id, discounts);

        return offer;
    });
}

export async function updateOffer(offerId: string, input: UpdateOfferInput, actorId: string) {
    const { offerPositions: rawPositions, flatrates: rawFlatrates, discounts, expectedVersion } = input;

    const positions = await pricePositions(rawPositions, input.customerId);
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
                snapshotVersion: 1,
                snapshot: snapshot as Prisma.InputJsonValue,
            },
        });

        const [offer] = await tx.offer.updateManyAndReturn({
            where: { id: offerId },
            data: {
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
        if (revision.snapshotVersion !== 1) {
            throw new AppException(
                `Offer revision snapshot version ${revision.snapshotVersion} is not supported.`,
                422,
                "UNSUPPORTED_REVISION_SNAPSHOT_VERSION",
            );
        }

        let restored;

        try {
            restored = parseOfferRevisionSnapshot(revision.snapshot);
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
                snapshotVersion: 1,
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

export async function createOfferPositions(offerId: string, positions: CreateOfferPositionInput[]) {
    const priced = await pricePositions(positions);

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
