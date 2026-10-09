import { describe, expect, it } from "vitest";
import { defaultsFor } from "./use-order-modal";
import { orderFormSchema } from "./use-order-form";
import type { Offer } from "@keepit/schemas";

const offer = {
    id: "offer-1",
    version: 3,
    duration_months: 12,
    offerPositions: [
        { id: "p1", quantity: 10, free_months: 0, eur_user_month: 500, product: { translations: [] } },
        { id: "p2", quantity: 2, free_months: 1, eur_user_month: 900, product: { translations: [] } },
    ],
} as unknown as Offer;

describe("order modal defaults", () => {
    it("prefills purchase prices with the sales price of each position", () => {
        const values = defaultsFor(offer);
        expect(values.positions).toEqual([
            { offerPositionId: "p1", purchase_eur_user_month: 500 },
            { offerPositionId: "p2", purchase_eur_user_month: 900 },
        ]);
        expect(values.orderId).toBe("");
    });

    it("cannot be submitted before an offer is selected (no positions) or without order number", () => {
        expect(orderFormSchema.safeParse({ ...defaultsFor(offer), positions: [] }).success).toBe(false);
        expect(orderFormSchema.safeParse(defaultsFor(offer)).success).toBe(false);
        expect(orderFormSchema.safeParse({ ...defaultsFor(offer), orderId: "000042" }).success).toBe(true);
    });
});
