import { describe, expect, it, vi } from "vitest";
import { vatForOrder } from "./document-vat.js";

const tx = (net_amount: number, customerRate: number) => ({
    order: { findUniqueOrThrow: vi.fn(async () => ({ offer: { net_amount, customer: { taxRate: customerRate } } })) },
}) as never;

describe("vatForOrder", () => {
    it("uses the rate from the form and offer.net_amount as net", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", 7.7)).resolves.toEqual({
            taxRate: 7.7, net_cents: 90_000, vat_cents: 6_930, gross_cents: 96_930,
        });
    });

    it("falls back to the customer's current rate", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", undefined)).resolves.toMatchObject({ taxRate: 19, vat_cents: 17_100 });
    });

    it("accepts 0 % (reverse charge) explicitly — not as a fallback", async () => {
        await expect(vatForOrder(tx(90_000, 19), "order", 0)).resolves.toMatchObject({ taxRate: 0, vat_cents: 0, gross_cents: 90_000 });
    });
});
