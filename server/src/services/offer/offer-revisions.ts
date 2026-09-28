import { Prisma } from "@prisma/client";

import { assertOfferEditable } from "../offer-acceptance.service.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import {
    OFFER_REVISION_SNAPSHOT_VERSION,
    buildOfferRevisionSnapshot,
    parseOfferRevisionSnapshot,
} from "../../schemas/revision-schemas.js";
import { replaceDiscounts, replaceFlatRates, replacePositions } from "./offer-write.js";

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
