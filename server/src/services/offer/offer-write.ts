import { OfferDerivationType, Prisma } from "@prisma/client";

import { prisma } from "../../lib/prismaClient.js";
import type { PricedDiscount, PricedFlatrate, PricedPosition, PriceHeader } from "./offer-pricing.js";

export async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: PricedPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
            offerId, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
            tariffVersionId: tariffVersionId ?? null,
        })),
    });
}

export async function replaceFlatRates(tx: Prisma.TransactionClient, offerId: string, flatRates: PricedFlatrate[]) {
    await tx.offerFlatRate.deleteMany({ where: { offerId } });
    await tx.offerFlatRate.createMany({
        data: flatRates.map(({ flatRateId, quantity, total_cents }) => ({
            offerId, flatRateId, quantity, total_cents,
        })),
    });
}

export async function replaceDiscounts(tx: Prisma.TransactionClient, offerId: string, discounts: ReadonlyArray<PricedDiscount>) {
    await tx.offerDiscount.deleteMany({ where: { offerId } });
    if (discounts.length === 0) return;

    await tx.offerDiscount.createMany({
        data: discounts.map(({ title, description, amount_cents }) => ({
            offerId, title, description: description ?? null, amount_cents,
        })),
    });
}

export function sumDiscounts(discounts: ReadonlyArray<PricedDiscount>): number {
    return discounts.reduce((sum, d) => sum + d.amount_cents, 0);
}

/** Skalarfelder eines Angebots — alles ausser Positionen, Flatrates und Rabatten. */
export type OfferFields = PriceHeader & {
    customerId: string;
    contactPersonId: string;
    userId: string;
    supplierId: string | null;
    quoteId: string;
    paymentTerm: string;
    language: "DE" | "EN";
    validUntil: string | null;
    requestFrom: string | null;
    featureComparison: boolean;
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
        const net_amount =
            positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
            flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
            sumDiscounts(discounts);

        const offer = await tx.offer.create({
            data: {
                ...fields,
                net_amount,
                renewedFromOfferId: options?.renewedFromOfferId ?? null,
                derivationType: options?.derivationType ?? null,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
                offerId: offer.id, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
                tariffVersionId,
            })),
        });

        if (flatrates.length > 0) {
            await tx.offerFlatRate.createMany({
                data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                    offerId: offer.id, flatRateId, quantity, total_cents,
                })),
            });
        }

        await replaceDiscounts(tx, offer.id, discounts);

        return offer;
    });
}
