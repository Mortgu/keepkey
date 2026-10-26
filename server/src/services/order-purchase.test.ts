import { describe, expect, it } from "vitest";
import { purchaseLines, purchaseNetAmount, purchaseUnitCents } from "./order-purchase.js";

const snapshot = [{ id: "p1" }, { id: "p2" }];

describe("purchaseLines", () => {
    it("stores the entered total per position, without free months", () => {
        const lines = purchaseLines(snapshot, [
            { offerPositionId: "p1", purchase_total_cents: 40_000 },
            { offerPositionId: "p2", purchase_total_cents: 0 },
        ]);

        expect(lines).toEqual([
            { offerPositionId: "p1", purchase_total_cents: 40_000 },
            { offerPositionId: "p2", purchase_total_cents: 0 },
        ]);
        expect(purchaseNetAmount(lines)).toBe(40_000);
    });

    it("keeps snapshot order regardless of input order", () => {
        const lines = purchaseLines(snapshot, [
            { offerPositionId: "p2", purchase_total_cents: 1 },
            { offerPositionId: "p1", purchase_total_cents: 1 },
        ]);
        expect(lines.map((l) => l.offerPositionId)).toEqual(["p1", "p2"]);
    });

    it.each([
        ["missing", [{ offerPositionId: "p1", purchase_total_cents: 1 }]],
        ["unknown", [{ offerPositionId: "p1", purchase_total_cents: 1 }, { offerPositionId: "p2", purchase_total_cents: 1 }, { offerPositionId: "px", purchase_total_cents: 1 }]],
        ["duplicate", [{ offerPositionId: "p1", purchase_total_cents: 1 }, { offerPositionId: "p1", purchase_total_cents: 2 }]],
    ])("rejects %s positions with 422", (_label, input) => {
        expect(() => purchaseLines(snapshot, input)).toThrow(expect.objectContaining({
            statusCode: 422,
            code: "PURCHASE_POSITIONS_MISMATCH",
        }));
    });
});

describe("purchaseUnitCents", () => {
    it("derives the unit price from the total, rounded to cents", () => {
        expect(purchaseUnitCents(100_000, 3, 12)).toBe(2_778);
        expect(purchaseUnitCents(36_000, 3, 12)).toBe(1_000);
    });

    it("is 0 when there is nothing to divide by", () => {
        expect(purchaseUnitCents(5_000, 0, 12)).toBe(0);
        expect(purchaseUnitCents(5_000, 3, 0)).toBe(0);
    });
});
