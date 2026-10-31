import { formatOfferData } from "@/pipelines/offer/build-offer.js";
import type { Prisma } from "@prisma/client";
import { AppException } from "@/lib/exceptions.js";
import { contractOrderBy } from "../contract/contract.service.js";
import { documentOwnerType } from "../document/document-repo.js";
import { serializeAcceptedOfferSnapshot } from "@/schemas/accepted-offer.js";

export const acceptanceInclude = {
    customer: true,
    contactPerson: true,
    user: true,
    contract: { include: { translations: true } },
    offerPositions: {
        include: { product: { include: { translations: true } } },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    },
    offerFlatRates: {
        include: { flatRate: { include: { translations: true } } },
        orderBy: { id: "asc" },
    },
    offerDiscounts: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
} satisfies Prisma.OfferInclude;

export async function acceptOffer(tx: Prisma.TransactionClient, offerId: string, expectedVersion: number) {
    const offer = await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: acceptanceInclude,
    });

    if (offer.version !== expectedVersion) {
        throw new AppException(
            "The offer changed before acceptance. Reload it and try again.",
            409,
            "VERSION_CONFLICT",
        );
    }

    const contracts = await tx.contract.findMany({
        include: { translations: true },
        orderBy: contractOrderBy,
    });

    const offerTemplate = await formatOfferData({ offer, contracts });
    const acceptedAt = new Date();
    const acceptedSnapshot = serializeAcceptedOfferSnapshot(
        {
            ...offer,
            employeeId: offer.userId,
            employee: offer.user,
            positions: offer.offerPositions.map(({ isOptional, ...position }) => ({
                ...position,
                optional: isOptional,
            })),
            flatRates: offer.offerFlatRates,
            discounts: offer.offerDiscounts,
        },
        offerTemplate,
    );
    await tx.offer.update({
        where: { id: offerId },
        data: { acceptedAt, acceptedSnapshot, version: { increment: 1 } },
    });
    // Reject in-flight document jobs that loaded live master data before acceptance.
    await tx.document.updateMany({
        where: { type: documentOwnerType("offer"), offerId, isCurrent: true },
        data: { isCurrent: false },
    });
    return acceptedAt;
}
