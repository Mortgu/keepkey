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
    it("leaves purchase totals empty instead of prefilling the sales price", () => {
        const values = defaultsFor(offer);
        expect(values.positions).toEqual([
            { offerPositionId: "p1", purchase_total_cents: null },
            { offerPositionId: "p2", purchase_total_cents: null },
        ]);
        expect(values.orderId).toBe("");
    });

    it("cannot be submitted before an offer is selected (no positions), without order number or with missing totals", () => {
        const filled = {
            ...defaultsFor(offer),
            orderId: "000042",
            positions: [
                { offerPositionId: "p1", purchase_total_cents: 50_000 },
                { offerPositionId: "p2", purchase_total_cents: 0 },
            ],
        };
        expect(orderFormSchema.safeParse({ ...filled, positions: [] }).success).toBe(false);
        expect(orderFormSchema.safeParse({ ...filled, orderId: "" }).success).toBe(false);
        expect(orderFormSchema.safeParse({ ...defaultsFor(offer), orderId: "000042" }).success).toBe(false);
        expect(orderFormSchema.safeParse(filled).success).toBe(true);
    });
});
