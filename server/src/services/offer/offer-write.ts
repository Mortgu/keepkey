import { OfferDerivationType } from "@prisma/client";
import { prisma } from "@/lib/prismaClient.js";

import {
    calculateNetAmount,
    type PricedDiscount,
    type PricedFlatrate,
    type PricedPosition,
    type PriceHeader,
} from "./offer-pricing.js";
import {replaceDiscounts} from "@/services/offer/utils/replace.offer.js";

/** Alles, was eine Revision festhält: Kopf plus Positionen, Flatrates und Rabatte. */
export const offerLinesInclude = {
    offerPositions: true,
    offerFlatRates: true,
    offerDiscounts: true,
} as const;

/** Skalarfelder eines Angebots — alles ausser Positionen, Flatrates und Rabatten. */
export type OfferFields = PriceHeader & {
    customerId: string;
    contactPersonId: string;
    userId: string;
    supplierId: string | null;
    quoteNumber: string;
    paymentTerm: string;
    language: "DE" | "EN";
    validFrom: string | null;
    validUntil: string | null;
    requestFrom: string | null;
    showsFeatureComparison: boolean;
    toCompare: string[];
};

/**
 * Schreibt ein Angebot mit bereits bepreisten Bestandteilen.
 *
 * Bewusst von der Preisermittlung getrennt: `createOffer` bepreist über den
 * Live-Tarif, `extendOffer` über die angepinnte Tarif-Version — die Persistenz
 * inklusive `net_amount`-Formel ist für beide dieselbe.
 */
export async function persistOffer(
    fields: OfferFields,
    positions: PricedPosition[],
    flatrates: PricedFlatrate[],
    discounts: ReadonlyArray<PricedDiscount>,
    options?: { renewedFromOfferId?: string; derivationType?: OfferDerivationType },
) {
    return prisma.$transaction(async (tx) => {
        const net_amount = calculateNetAmount(positions, flatrates, discounts);

        const offer = await tx.offer.create({
            data: {
                ...fields,
                net_amount,
                renewedFromOfferId: options?.renewedFromOfferId ?? null,
                derivationType: options?.derivationType ?? null,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, free_months, quantity, isOptional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
                offerId: offer.id,
                productId,
                free_months,
                quantity,
                eur_user_month,
                total_cents,
                discount_cents,
                isOptional,
                tariffVersionId,
            })),
        });

        if (flatrates.length > 0) {
            await tx.offerFlatRate.createMany({
                data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                    offerId: offer.id,
                    flatRateId,
                    quantity,
                    total_cents,
                })),
            });
        }

        await replaceDiscounts(tx, offer.id, discounts);

        return offer;
    });
}
