import { OfferDerivationType, Prisma } from "@prisma/client";

import { prisma } from "../../lib/prismaClient.js";
import { toDate } from "../../utils/utils.js";
import type { PricedDiscount, PricedFlatrate, PricedPosition, PriceHeader } from "./offer-pricing.js";

/** Mapped die Scalar-Felder eines Offers auf Prisma-Datentypen (Datumsfelder, nullables). */
function mapOfferData<T extends { supplierId?: string | null; validUntil?: string | null; requestFrom?: string | null; date?: string | null }>(fields: T) {
    const { supplierId, validUntil, requestFrom, date, ...rest } = fields;

    return {
        ...rest,
        date: toDate(date) ?? new Date(),
        supplierId: supplierId || null,
        validUntil: toDate(validUntil),
        requestFrom: toDate(requestFrom),
    };
}

/** Summiert Positionen + Flatrates neu und schreibt net_amount am Offer. */
async function recomputeNetAmount(tx: Prisma.TransactionClient, offerId: string): Promise<void> {
    const [positionsSum, positionsDiscountSum, flatratesSum, discountsSum] = await Promise.all([
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
        tx.offerPosition.aggregate({
            where: { offerId },
            _sum: { discount_cents: true },
        }),
        tx.offerFlatRate.aggregate({
            where: { offerId },
            _sum: { total_cents: true },
        }),
        tx.offerDiscount.aggregate({
            where: { offerId },
            _sum: { amount_cents: true },
        }),
    ]);

    const positionsNet = (positionsSum._sum.total_cents ?? 0) - (positionsDiscountSum._sum.discount_cents ?? 0);
    const discountsNet = discountsSum._sum.amount_cents ?? 0;

    await tx.offer.update({
        where: { id: offerId },
        data: {
            net_amount: positionsNet + (flatratesSum._sum.total_cents ?? 0) - discountsNet,
        },
    });
}

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
