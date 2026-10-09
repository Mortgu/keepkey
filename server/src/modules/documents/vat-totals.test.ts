import { describe, expect, it } from "vitest";
import { vatTotals } from "@keepit/schemas";

describe("vatTotals", () => {
    it("adds 19 % VAT and keeps net + vat === gross", () => {
        expect(vatTotals(10_000, 19)).toEqual({ netCents: 10_000, vatRate: 19, vatCents: 1_900, grossCents: 11_900 });
    });

    it("rounds the VAT to full cents, half up", () => {
        // 333 * 0.19 = 63.27 → 63
        expect(vatTotals(333, 19).vatCents).toBe(63);
        // 50 * 0.19 = 9.5 → 10
        expect(vatTotals(50, 19).vatCents).toBe(10);
    });

    it("handles 0 % (e.g. reverse charge) and fractional rates like 7.7 %", () => {
        expect(vatTotals(12_345, 0)).toMatchObject({ vatCents: 0, grossCents: 12_345 });
        expect(vatTotals(10_000, 7.7)).toMatchObject({ vatCents: 770, grossCents: 10_770 });
    });
});
