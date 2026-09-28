import { Prisma } from "@prisma/client";
import { UpdateOfferInput } from '@keepit/schemas';

import { assertOfferEditable } from "../offer-acceptance.service.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import { assertStandardDuration } from "../tariff.service.js";
import {
    OFFER_REVISION_SNAPSHOT_VERSION,
    buildOfferRevisionSnapshot,
} from "../../schemas/revision-schemas.js";
import { priceFlatrates, pricePositions } from "./offer-pricing.js";
import { replaceDiscounts, replaceFlatRates, replacePositions, sumDiscounts } from "./offer-write.js";

export async function updateOffer(offerId: string, input: UpdateOfferInput, actorId: string) {
    const { offerPositions: rawPositions, flatrates: rawFlatrates, discounts, expectedVersion } = input;

    await assertStandardDuration(input.duration_months);

    const header = { contractId: input.contractId, duration_months: input.duration_months };

    return prisma.$transaction(async (tx) => {
        await assertOfferEditable(tx, offerId);

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

        const positions = await pricePositions(rawPositions, header, input.customerId, actorId);
        const flatrates = await priceFlatrates(rawFlatrates);
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
            sumDiscounts(discounts);

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
    }, { timeout: 30_000 });
}
