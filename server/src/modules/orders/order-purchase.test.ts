import { describe, expect, it } from "vitest";
import { purchaseLines, purchaseNetAmount } from "./order-purchase.js";

const snapshot = [
    { id: "p1", productId: "m365", quantity: 10, free_months: 2, eur_user_month: 500 },
    { id: "p2", productId: "gws", quantity: 3, free_months: 0, eur_user_month: 800 },
];

describe("purchaseLines", () => {
    it("applies the offer formulas to the purchase price", () => {
        const lines = purchaseLines(snapshot, [
            { offerPositionId: "p1", purchase_eur_user_month: 400 },
            { offerPositionId: "p2", purchase_eur_user_month: 700 },
        ], 12);

        expect(lines).toEqual([
            { offerPositionId: "p1", purchase_eur_user_month: 400, purchase_total_cents: 400 * 10 * 12, purchase_discount_cents: 400 * 10 * 2 },
            { offerPositionId: "p2", purchase_eur_user_month: 700, purchase_total_cents: 700 * 3 * 12, purchase_discount_cents: 0 },
        ]);
        expect(purchaseNetAmount(lines)).toBe(48_000 - 8_000 + 25_200);
    });

    it("keeps snapshot order regardless of input order", () => {
        const lines = purchaseLines(snapshot, [
            { offerPositionId: "p2", purchase_eur_user_month: 1 },
            { offerPositionId: "p1", purchase_eur_user_month: 1 },
        ], 12);
        expect(lines.map((l) => l.offerPositionId)).toEqual(["p1", "p2"]);
    });

    it.each([
        ["missing", [{ offerPositionId: "p1", purchase_eur_user_month: 1 }]],
        ["unknown", [{ offerPositionId: "p1", purchase_eur_user_month: 1 }, { offerPositionId: "p2", purchase_eur_user_month: 1 }, { offerPositionId: "px", purchase_eur_user_month: 1 }]],
        ["duplicate", [{ offerPositionId: "p1", purchase_eur_user_month: 1 }, { offerPositionId: "p1", purchase_eur_user_month: 2 }]],
    ])("rejects %s positions with 422", (_label, input) => {
        expect(() => purchaseLines(snapshot, input, 12)).toThrow(expect.objectContaining({
            statusCode: 422,
            code: "PURCHASE_POSITIONS_MISMATCH",
        }));
    });
});
