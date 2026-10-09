import { describe, expect, it } from "vitest";
import { calculateNetAmount } from "./offer-pricing.js";

describe("calculateNetAmount", () => {
    it("is zero for an empty offer", () => {
        expect(calculateNetAmount([], [], [])).toBe(0);
    });

    it("subtracts free months from positions", () => {
        const positions = [
            { total_cents: 12_000, discount_cents: 2_000 },
            { total_cents: 5_000, discount_cents: 0 },
        ];

        expect(calculateNetAmount(positions, [], [])).toBe(15_000);
    });

    it("adds flat rates and subtracts discounts", () => {
        expect(calculateNetAmount(
            [{ total_cents: 10_000, discount_cents: 1_000 }],
            [{ total_cents: 2_500 }, { total_cents: 500 }],
            [{ amount_cents: 1_500 }],
        )).toBe(10_500);
    });

    it("can become negative when discounts exceed the total", () => {
        expect(calculateNetAmount([], [{ total_cents: 1_000 }], [{ amount_cents: 1_200 }])).toBe(-200);
    });
});
