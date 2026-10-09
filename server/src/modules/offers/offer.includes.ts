import { Language } from "@keepit/schemas";
import type { Prisma } from "@prisma/client";

export const offerIncludeAll = (language: Language) => ({
    customer: true,
    customerContactPerson: true,
    user: true,
    contract: {
        include: {
            translations: {
                where: { language: language }
            },
        },
    },
    offerPositions: {
        include: {
            product: {
                include: {
                    translations: {
                        where: { language: language }
                    },
                },
            },
        },
        orderBy: [
            { createdAt: "asc" },
            { id: "asc" },
        ],
    },
    offerFlatRates: {
        include: {
            flatRate: {
                include: {
                    translations: {
                        where: { language: language }
                    },
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    },
    offerDiscounts: {
        orderBy: [
            { createdAt: "asc" },
            { id: "asc" },
        ],
    },
    offerDocuments: {
        include: {
            task: true,
        }
    },
}) satisfies Prisma.OfferInclude;

export type OfferIncludeAll = Prisma.OfferGetPayload<{
    include: ReturnType<typeof offerIncludeAll>;
}>;