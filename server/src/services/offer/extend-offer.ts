import { OfferDerivationType } from "@prisma/client";
import { ExtendOfferInput, PositionPrice } from '@keepit/schemas';

import { prisma } from "@/lib/prismaClient.js";
import { AppException } from "@/lib/exceptions.js";
import { type PricedPosition, priceFromPin } from "./offer-pricing.js";
import { persistOffer } from "./offer-write.js";

async function loadSourcePosition(offerId: string, positionId: string) {
    const position = await prisma.offerPosition.findUnique({
        where: { id: positionId },
        select: {
            id: true, offerId: true, productId: true,
            freeMonths: true, unitCents: true, tariffVersionId: true,
        },
    });

    if (!position || position.offerId !== offerId) {
        throw new AppException("Offer position not found", 422, "OFFER_POSITION_NOT_FOUND");
    }

    return position;
}

export async function getExtensionPrice(offerId: string, positionId: string, quantity: number): Promise<PositionPrice> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppException("quantity muss eine positive Ganzzahl sein.", 400, "INVALID_INPUT");
    }

    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        select: { customerId: true, duration_months: true },
    });

    if (!offer) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const source = await loadSourcePosition(offerId, positionId);
    const { unitCents, totalCents, discountCents, fromSnapshot, origin, list_eur_user_month } =
        await priceFromPin(source, offer.duration_months, quantity, offer.customerId);

    return { unitCents, totalCents, discountCents, fromSnapshot, origin, list_eur_user_month };
}

export async function extendOffer(sourceOfferId: string, input: ExtendOfferInput) {
    const source = await prisma.offer.findUnique({
        where: { id: sourceOfferId },
        include: { offerPositions: true },
    });

    if (!source) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const sourceById = new Map(source.offerPositions.map((position) => [position.id, position]));
    const positions: PricedPosition[] = [];

    for (const requested of input.positions) {
        const sourcePosition = sourceById.get(requested.sourcePositionId);

        if (!sourcePosition) {
            throw new AppException(
                `Position ${requested.sourcePositionId} gehört nicht zum Quellangebot.`,
                422,
                "OFFER_POSITION_NOT_FOUND",
            );
        }

        const priced = await priceFromPin(
            sourcePosition, source.duration_months, requested.quantity, source.customerId,
        );

        positions.push({
            productId: sourcePosition.productId,
            freeMonths: sourcePosition.freeMonths,
            quantity: requested.quantity,
            optional: sourcePosition.optional,
            totalCents: priced.totalCents,
            unitCents: priced.unitCents,
            discountCents: priced.discountCents,
            tariffVersionId: priced.tariffVersionId,
        });
    }

    return persistOffer(
        {
            contractId: source.contractId,
            duration_months: source.duration_months,
            customerId: source.customerId,
            contactPersonId: source.contactPersonId,
            userId: source.userId,
            supplierId: source.supplierId,
            quoteId: input.quoteId,
            paymentTerm: source.paymentTerm,
            language: source.language,
            validFrom: input.validFrom,
            validUntil: input.validUntil,
            requestFrom: input.requestFrom,
            featureComparison: source.featureComparison,
            toCompare: source.toCompare,
        },
        positions,
        [],
        input.discounts,
        {
            renewedFromOfferId: sourceOfferId,
            derivationType: OfferDerivationType.LICENSE_EXTENSION,
        },
    );
}
