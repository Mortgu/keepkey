import { formatOfferData } from "../pipelines/offer/actions.js";
import type { Prisma } from "@prisma/client";
import { AppException } from "../lib/exceptions.js";
import { serializeAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";

export const acceptanceInclude = {
    customer: true,
    customerContactPerson: true,
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

export async function lockOffer(tx: Prisma.TransactionClient, offerId: string) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${offerId}`}))::text AS "lock"`;
    await tx.$queryRaw`SELECT id FROM "offer" WHERE id = ${offerId} FOR UPDATE`;
}

/** Must run inside the same transaction as every commercial mutation. */
export async function assertOfferEditable(
    tx: Prisma.TransactionClient,
    offerId: string,
) {
    await lockOffer(tx, offerId);
    const offer = await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { acceptedAt: true },
    });
    if (offer.acceptedAt) {
        throw new AppException(
            "Accepted offers cannot be changed. Create a new offer instead.",
            409,
            "OFFER_ACCEPTED",
        );
    }
}

export async function acceptOffer(
    tx: Prisma.TransactionClient,
    offerId: string,
    expectedVersion: number,
) {
    await assertOfferEditable(tx, offerId);
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
    });
    const offerTemplate = await formatOfferData({ offer, contracts });
    const acceptedAt = new Date();
    const acceptedSnapshot = serializeAcceptedOfferSnapshot(
        {
            ...offer,
            employeeId: offer.userId,
            employee: offer.user,
            positions: offer.offerPositions,
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
    await tx.offerDocument.updateMany({
        where: { offerId, isCurrent: true },
        data: { isCurrent: false },
    });
    return acceptedAt;
}
