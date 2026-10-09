import type { Order, OrderPosition, Prisma } from "@prisma/client";
import type { SupplierPosition } from "@keepit/schemas";
import { parseAcceptedOfferSnapshot } from "@/modules/offers/accepted-offer.schema.js";
import { purchaseNetAmount } from "./order-purchase.js";

export type OrderWithSource = Order & {
    offer: { acceptedSnapshot: Prisma.JsonValue | null };
    /** Einkaufspreise; fehlt bei Altbestellungen, die vor der Einkaufsseite angelegt wurden. */
    positions?: OrderPosition[];
};

/**
 * Keeps existing response fields as derived values, never as editable Order data.
 *
 * Zwei Preisseiten, bewusst getrennt benannt:
 *  - `orderPositions`, `net_amount`, `flatRates`, `discounts`: Kundenseite aus dem
 *    Snapshot. Davon leben AB und Rechnung — hier dürfen nie Einkaufswerte stehen.
 *  - `supplierPositions`, `purchase_net_amount`: Einkaufsseite für die Bestellung
 *    an den Zulieferer. Altbestellungen ohne gespeicherte Einkaufspreise fallen
 *    auf den Verkaufspreis zurück (`fallback: true`), also auf das alte Verhalten.
 */
export function presentOrder<T extends OrderWithSource>(order: T) {
    const source = parseAcceptedOfferSnapshot(order.offer.acceptedSnapshot);
    const { offer: _offer, positions, ...metadata } = order;
    const { acceptedSnapshot: _snapshot, ...publicOffer }: T["offer"] =
        order.offer;

    const stored = new Map((positions ?? []).map((p) => [p.offerPositionId, p]));
    const supplierPositions: SupplierPosition[] = source.positions.map((p) => {
        const row = stored.get(p.id);
        return {
            offerPositionId: p.id,
            productId: p.productId,
            quantity: p.quantity,
            free_months: p.free_months,
            eur_user_month: p.eur_user_month,
            purchase_eur_user_month: row?.purchase_eur_user_month ?? p.eur_user_month,
            purchase_total_cents: row?.purchase_total_cents ?? p.total_cents,
            purchase_discount_cents: row?.purchase_discount_cents ?? p.discount_cents,
            fallback: row === undefined,
        };
    });

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
        supplierPositions,
        purchase_net_amount: purchaseNetAmount(supplierPositions),
    };
}
