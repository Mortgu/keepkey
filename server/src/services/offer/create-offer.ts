import { OfferDerivationType } from "@prisma/client";
import { CreateOfferInput } from '@keepit/schemas';

import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import { assertStandardDuration } from "../tariff.service.js";
import { priceFlatrates, pricePositions } from "./offer-pricing.js";
import { persistOffer } from "./offer-write.js";

export async function createOffer(
    input: CreateOfferInput,
    options?: { renewedFromOfferId?: string; derivationType?: OfferDerivationType; actorId?: string | null },
) {
    await assertStandardDuration(input.duration_months);

    const header = { contractId: input.contractId, duration_months: input.duration_months };

    const positions = await pricePositions(input.offerPositions, header, input.customerId, options?.actorId ?? null);
    const flatrates = await priceFlatrates(input.flatrates);

    return persistOffer(
        {
            ...header,
            customerId: input.customerId,
            contactPersonId: input.contactPersonId,
            userId: input.userId,
            supplierId: input.supplierId,
            quoteId: input.quoteId,
            paymentTerm: input.paymentTerm,
            language: input.language,
            validFrom: input.validFrom,
            validUntil: input.validUntil,
            requestFrom: input.requestFrom,
            featureComparison: input.featureComparison,
            toCompare: input.toCompare,
        },
        positions,
        flatrates,
        input.discounts,
        { renewedFromOfferId: options?.renewedFromOfferId, derivationType: options?.derivationType },
    );
}

export async function renewOffer(sourceOfferId: string, input: CreateOfferInput, actorId: string | null) {
    const source = await prisma.offer.findUnique({
        where: { id: sourceOfferId },
        select: { id: true },
    });
    if (!source) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    return createOffer(input, {
        renewedFromOfferId: sourceOfferId,
        derivationType: OfferDerivationType.RENEWAL,
        actorId,
    });
}
