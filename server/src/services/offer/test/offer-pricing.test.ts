import { describe, expect, it } from "vitest";
import { calculateNetAmount } from "../offer-pricing.js";

describe("calculateNetAmount", () => {
    it("is zero for an empty offer", () => {
        expect(calculateNetAmount([], [], [])).toBe(0);
    });

    it("subtracts free months from positions", () => {
        const positions = [
            { totalCents: 12_000, discountCents: 2_000 },
            { totalCents: 5_000, discountCents: 0 },
        ];

        expect(calculateNetAmount(positions, [], [])).toBe(15_000);
    });

    it("adds flat rates and subtracts discounts", () => {
        expect(calculateNetAmount(
            [{ totalCents: 10_000, discountCents: 1_000 }],
            [{ totalCents: 2_500 }, { totalCents: 500 }],
            [{ totalCents: 1_500 }],
        )).toBe(10_500);
    });

    it("can become negative when discounts exceed the total", () => {
        expect(calculateNetAmount([], [{ totalCents: 1_000 }], [{ totalCents: 1_200 }])).toBe(-200);
    });
});
