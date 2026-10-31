import {Prisma} from "@prisma/client";
import type {PricedDiscount, PricedFlatrate, PricedPosition} from "@/services/offer/offer-pricing.js";

/** Replaces items, flat rates, and discounts in an existing offer. */
export async function replaceOfferLines(
    tx: Prisma.TransactionClient,
    offerId: string,
    lines: {
        positions: PricedPosition[];
        flatRates: PricedFlatrate[];
        discounts: ReadonlyArray<PricedDiscount>;
    },
): Promise<void> {
    await replacePositions(tx, offerId, lines.positions);
    await replaceFlatRates(tx, offerId, lines.flatRates);
    await replaceDiscounts(tx, offerId, lines.discounts);
}

export async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: PricedPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, free_months, quantity, isOptional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
            offerId, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, isOptional,
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
