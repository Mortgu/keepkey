import { assertOfferEditable } from "../offer-acceptance.service.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import {
    OFFER_REVISION_SNAPSHOT_VERSION,
    parseOfferRevisionSnapshot,
} from "../../schemas/revision-schemas.js";
import {
    assertExpectedVersion,
    invalidateCurrentDocuments,
    offerLinesInclude,
    recordRevision,
    replaceOfferLines,
} from "./offer-write.js";

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

export async function restoreOfferRevision(
    offerId: string,
    revisionId: string,
    expectedVersion: number,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        await assertOfferEditable(tx, offerId);

        const current = await tx.offer.findUnique({
            where: { id: offerId },
            include: offerLinesInclude,
        });
        if (!current) {
            throw new AppException("Offer not found!", 404, "OFFER_NOT_FOUND");
        }
        assertExpectedVersion(current, expectedVersion);

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

        await recordRevision(tx, current, actorId);

        const offer = await tx.offer.update({
            where: { id: offerId },
            data: {
                ...restored.offer,
                date: new Date(restored.offer.date),
                validFrom: restored.offer.validFrom ? new Date(restored.offer.validFrom) : null,
                validUntil: restored.offer.validUntil ? new Date(restored.offer.validUntil) : null,
                requestFrom: restored.offer.requestFrom ? new Date(restored.offer.requestFrom) : null,
                version: { increment: 1 },
            },
        });

        await replaceOfferLines(tx, offerId, restored);
        await invalidateCurrentDocuments(tx, offerId);

        return offer;
    });
}
