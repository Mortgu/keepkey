import { OfferFilterParams } from '@keepit/schemas';

import { presentOffer } from "../accepted-offer-view.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";

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

    return { items: items.map(presentOffer), nextCursor };
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

    return presentOffer(offer);
}

export async function getNextQuoteId(): Promise<number> {
    const quoteId = 0; //await getLatestQuoteId();
    return quoteId + 1;
}
