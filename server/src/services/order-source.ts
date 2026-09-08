import type { Order, Prisma } from "@prisma/client";
import { parseAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";

export type OrderWithSource = Order & {
    offer: { acceptedSnapshot: Prisma.JsonValue | null };
};

/** Keeps existing response fields as derived values, never as editable Order data. */
export function presentOrder<T extends OrderWithSource>(order: T) {
    const source = parseAcceptedOfferSnapshot(order.offer.acceptedSnapshot);
    const { offer: _offer, ...metadata } = order;
    const { acceptedSnapshot: _snapshot, ...publicOffer }: T["offer"] =
        order.offer;
    return {
        ...source,
        ...metadata,
        offer: publicOffer,
        orderPositions: source.positions.map((p) => ({
            ...p,
            orderId: order.id,
            total_cents: p.total_cents - p.discount_cents,
        })),
        flatRates: source.flatRates.map((p) => ({ ...p, orderId: order.id })),
    };
}
