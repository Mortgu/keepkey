import { describe, expect, it, vi } from "vitest";
import { orderFixture } from "@/modules/orders/order-fixtures.js";
import { presentOrder } from "@/modules/orders/order-source.js";
import { confirmationTemplateSchema } from "./confirmation.template.schema.js";

vi.mock("@/core/prisma.js", () => ({
    prisma: {
        confirmation: {
            findUniqueOrThrow: vi.fn(async () => ({
                id: "conf-1",
                confirmationId: "000042",
                date: new Date("2026-10-06T00:00:00Z"),
                orderId: "order",
                taxRate: 19, net_cents: 90000, vat_cents: 17100, gross_cents: 107100,
            })),
        },
    },
}));
vi.mock("@/modules/orders/order.service.js", () => ({
    getOrderById: vi.fn(async () => presentOrder(orderFixture())),
}));

import { buildConfirmation } from "./build-confirmation.js";

describe("buildConfirmation", () => {
    it("adds the confirmation number and a VAT block on top of the order data", async () => {
        const built = await buildConfirmation("conf-1");
        const data = confirmationTemplateSchema.parse(built.data);
        const order = presentOrder(orderFixture());

        expect(data.confirmationId).toBe("000042");
        expect(data.confirmationDate).toBe("06. Oktober 2026");
        // Alles aus der Bestellung bleibt verfügbar.
        expect(data.orderId).toBe(order.orderId);
        expect(data.customer.companyName).toBe(order.customer.companyName);

        // Steuerblock aus der Row, nicht aus dem Kunden.
        const net = order.net_amount;
        const vat = Math.round(net * 0.19);
        const eur = (cents: number) => (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        expect(data.vatRate).toBe("19,00 %");
        expect(data.netTotal).toContain(eur(net));
        expect(data.vatAmount).toContain(eur(vat));
        expect(data.grossTotal).toContain(eur(net + vat));
    });

    it("shows the real unit price and the free-month deduction per line", async () => {
        const built = await buildConfirmation("conf-1");
        const data = confirmationTemplateSchema.parse(built.data);
        const line = (data.groups[0] as unknown as { items: Array<{ free_months: number; price: Record<string, string> }> }).items[0]!;

        expect(line.free_months).toBe(3);
        expect(line.price.unit).toBe("10,00 €");
        expect(line.price.gross).toBe("1.200,00 €");
        expect(line.price.discount).toBe("-300,00 €");
        expect(line.price.total).toBe("900,00 €");
        expect(data.netTotal).toBe("900,00 €");
    });

    it("names the document after the confirmation number, not the order", async () => {
        const built = await buildConfirmation("conf-1");
        const company = presentOrder(orderFixture()).customer.companyName.replaceAll(" ", "");
        expect(built.displayName).toBe(`000042_AB_${company}`);
        expect(built.language).toBe(presentOrder(orderFixture()).language);
    });
});
