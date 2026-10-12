import { formatOfferData } from "../pipelines/offer/build-offer.js";
import type { Prisma } from "@prisma/client";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { contractOrderBy } from "./contract.service.js";
import { serializeAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";
import type { DocumentType } from "@keepit/schemas";

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
        orderBy: contractOrderBy,
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

/**
 * Angenommene Angebote sind dauerhaft eingefroren — ihre Dokumente dürfen dann
 * weder umbenannt, gelöscht noch ersetzt werden. Betrifft nur `offer`: andere
 * Dokumenttypen kennen diesen Zustand nicht.
 */
export async function assertOfferDocumentEditable(type: DocumentType, id: string) {
    if (type !== "offer") return;
    const doc = await prisma.offerDocument.findUnique({
        where: { id },
        select: { offer: { select: { acceptedAt: true } } },
    });
    if (doc?.offer.acceptedAt) {
        throw new AppException(
            "Accepted offers' documents can no longer be changed.",
            409,
            "OFFER_ACCEPTED",
        );
    }
}

/**
 * Ob sich Änderungen dieses Dokuments ins Angebot übernehmen lassen: nur für
 * Angebote, nur beim aktuellen Dokument des unveränderten Angebots. Wurde das
 * Angebot nach dem Erzeugen geändert (oder ist es angenommen), würde ein Wert
 * aus der Datei einen neueren Stand überschreiben.
 */
export async function canAdoptIntoSource(type: DocumentType, id: string): Promise<boolean> {
    if (type !== "offer") return false;

    const document = await prisma.offerDocument.findUnique({
        where: { id },
        select: { isCurrent: true, sourceVersion: true, offer: { select: { version: true, acceptedAt: true } } },
    });
    return Boolean(document?.isCurrent)
        && document?.sourceVersion === document?.offer.version
        && !document?.offer.acceptedAt;
}
