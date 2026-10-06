import { describe, expect, it, vi } from "vitest";
import { orderFixture } from "../../test/order-fixtures.js";
import { presentOrder } from "../../services/order-source.js";
import { invoiceContract } from "../../schemas/templates/invoice.template.schema.js";
import { formatEur } from "../../utils/utils.js";

vi.mock("../../lib/prismaClient.js", () => ({
    prisma: {
        invoice: {
            findUniqueOrThrow: vi.fn(async () => ({
                id: "inv-1",
                invoiceId: "2026-0007",
                date: new Date("2026-10-06T00:00:00Z"),
                orderId: "order",
            })),
        },
    },
}));
vi.mock("../../services/order.service.js", () => ({
    getOrderById: vi.fn(async () => presentOrder(orderFixture())),
}));

import { buildInvoice } from "./build-invoice.js";

const eur = (cents: number) => formatEur(cents / 100);

describe("buildInvoice", () => {
    it("turns positions, flat rates and discounts into numbered lines whose sum is the net amount", async () => {
        const built = await buildInvoice("inv-1");
        const data = invoiceContract.parse(built.data);
        const order = presentOrder(orderFixture());

        expect(data.invoiceNumber).toBe("2026-0007");
        expect(data.orderNumber).toBe(order.orderId);
        expect(data.items.map((i) => i.pos)).toEqual(data.items.map((_, i) => i + 1));
        expect(data.items).toHaveLength(order.orderPositions.length + order.flatRates.length + order.discounts.length);

        const lineSum = order.orderPositions.reduce((s, p) => s + p.total_cents - p.discount_cents, 0)
            + order.flatRates.reduce((s, f) => s + f.total_cents, 0)
            - order.discounts.reduce((s, d) => s + d.amount_cents, 0);
        expect(data.netTotal).toBe(eur(lineSum));
        // Gegenprobe über die Zeilen der Rechnung selbst.
        expect(data.items.map((i) => i.total)).toContain(eur(-order.discounts[0]!.amount_cents));
    });

    it("adds VAT from the snapshot tax rate and names the file after the invoice number", async () => {
        const built = await buildInvoice("inv-1");
        const data = invoiceContract.parse(built.data);
        const order = presentOrder(orderFixture());
        const net = order.orderPositions.reduce((s, p) => s + p.total_cents - p.discount_cents, 0)
            + order.flatRates.reduce((s, f) => s + f.total_cents, 0)
            - order.discounts.reduce((s, d) => s + d.amount_cents, 0);
        const vat = Math.round(net * order.customer.taxRate / 100);

        expect(data.vatRate).toBe("19,00 %");
        expect(data.vatAmount).toBe(eur(vat));
        expect(data.grossTotal).toBe(eur(net + vat));
        expect(built.displayName).toBe(`2026-0007_RE_${order.customer.companyName.replaceAll(" ", "")}`);
    });
});
