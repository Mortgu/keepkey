import { describe, expect, it, vi } from "vitest";
import { orderFixture } from "../../test/order-fixtures.js";
import { presentOrder } from "../../services/order-source.js";
import { confirmationTemplateSchema } from "../../schemas/templates/confirmation.template.schema.js";

vi.mock("../../lib/prismaClient.js", () => ({
    prisma: {
        confirmation: {
            findUniqueOrThrow: vi.fn(async () => ({
                id: "conf-1",
                confirmationId: "000042",
                date: new Date("2026-10-06T00:00:00Z"),
                orderId: "order",
            })),
        },
    },
}));
vi.mock("../../services/order.service.js", () => ({
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

        // 19 % aus dem Snapshot-Kunden, einmal gerundet.
        const net = order.net_amount;
        const vat = Math.round(net * 0.19);
        const eur = (cents: number) => (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        expect(data.vatRate).toBe("19,00 %");
        expect(data.netTotal).toContain(eur(net));
        expect(data.vatAmount).toContain(eur(vat));
        expect(data.grossTotal).toContain(eur(net + vat));
    });

    it("names the document after the confirmation number, not the order", async () => {
        const built = await buildConfirmation("conf-1");
        const company = presentOrder(orderFixture()).customer.companyName.replaceAll(" ", "");
        expect(built.displayName).toBe(`000042_AB_${company}`);
        expect(built.language).toBe(presentOrder(orderFixture()).language);
    });
});
