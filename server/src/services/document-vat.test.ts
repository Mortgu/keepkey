import { describe, expect, it, vi } from "vitest";
import { vatForOrder } from "./document-vat.js";

const tx = (netAmount: number, customerRate: number) => ({
    order: { findUniqueOrThrow: vi.fn(async () => ({ offer: { netAmount, customer: { taxRate: customerRate } } })) },
}) as never;

describe("vatForOrder", () => {
    it("uses the rate from the form and offer.netAmount as net", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", 7.7)).resolves.toEqual({
            taxRate: 7.7, netCents: 90_000, vatCents: 6_930, grossCents: 96_930,
        });
    });

    it("falls back to the customer's current rate", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", undefined)).resolves.toMatchObject({ taxRate: 19, vatCents: 17_100 });
    });

    it("accepts 0 % (reverse charge) explicitly — not as a fallback", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", 0)).resolves.toMatchObject({ taxRate: 0, vatCents: 0, grossCents: 90_000 });
    });
});
