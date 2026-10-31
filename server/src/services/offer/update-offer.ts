import { UpdateOfferInput } from '@keepit/schemas';

import { prisma } from "@/lib/prismaClient.js";
import { assertStandardDuration } from "../contract/tariff.service.js";
import { calculateNetAmount, priceFlatrates, pricePositions } from "./offer-pricing.js";
import {
    offerLinesInclude,
} from "./offer-write.js";
import {assertExpectedVersion, assertOfferEditable} from "@/services/offer/utils/assert.offer.js";
import {replaceOfferLines} from "@/services/offer/utils/replace.offer.js";
import {invalidateCurrentDocuments} from "@/services/offer/utils/invalidate.offer.js";

export async function updateOffer(offerId: string, input: UpdateOfferInput, actorId: string) {
    const { offerPositions: rawPositions, flatrates: rawFlatrates, discounts, expectedVersion } = input;

    await assertStandardDuration(input.duration_months);

    const header = { contractId: input.contractId, duration_months: input.duration_months };

    return prisma.$transaction(async (tx) => {
        await assertOfferEditable(tx, offerId);

        const current = await tx.offer.findFirstOrThrow({
            where: { id: offerId },
            include: offerLinesInclude,
        });

        assertExpectedVersion(current, expectedVersion);

        // Auf `tx`, nicht `prisma`: sonst öffnet sealTariffVersion je Position
        // eine eigene Transaktion, während diese hier eine Verbindung hält.
        const positions = await pricePositions(rawPositions, header, input.customerId, actorId, tx);
        const flatrates = await priceFlatrates(rawFlatrates, tx);
        const net_amount = calculateNetAmount(positions, flatrates, discounts);

        const [offer] = await tx.offer.updateManyAndReturn({
            where: { id: offerId },
            data: {
                ...header,
                customerId: input.customerId,
                contactPersonId: input.contactPersonId,
                userId: input.userId,
                quoteNumber: input.quoteNumber,
                language: input.language,
                supplierId: input.supplierId,
                paymentTerm: input.paymentTerm,
                validFrom: input.validFrom,
                validUntil: input.validUntil,
                requestFrom: input.requestFrom,
                featureComparison: input.featureComparison,
                toCompare: input.toCompare,
                net_amount,
                version: { increment: 1 },
            },
        });

        await replaceOfferLines(tx, offerId, { positions, flatRates: flatrates, discounts });
        await invalidateCurrentDocuments(tx, offerId);

        return offer;
    }, { timeout: 30_000 });
}
