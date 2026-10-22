import { describe, expect, it, vi } from "vitest";
import { orderFixture } from "../../test/order-fixtures.js";
import { presentOrder } from "../../services/order-source.js";
import { invoiceContract } from "../../schemas/templates/invoice.template.schema.js";
import { formatEur } from "../../utils/utils.js";

const fixture = () => ({ ...orderFixture(), contractStartDate: new Date("2026-11-01T00:00:00Z") });

vi.mock("../../lib/prismaClient.js", () => ({
    prisma: {
        invoice: {
            findUniqueOrThrow: vi.fn(async () => ({
                id: "inv-1",
                invoiceId: "2026-0007",
                date: new Date("2026-10-06T00:00:00Z"),
                orderId: "order",
                taxRate: 19, net_cents: 90000, vat_cents: 17100, gross_cents: 107100,
            })),
        },
        confirmation: { findUnique: vi.fn(async () => ({ confirmationId: "000042" })) },
    },
}));
vi.mock("../../services/order.service.js", () => ({
    getOrderById: vi.fn(async () => presentOrder(fixture())),
}));

import { buildInvoice, paymentTermDays } from "./build-invoice.js";

const eur = (cents: number) => formatEur(cents / 100);

describe("buildInvoice", () => {
    it("line totals add up to the stored net_cents (= offer.net_amount) — free months are not deducted twice", async () => {
        const data = invoiceContract.parse((await buildInvoice("inv-1")).data);
        const offer = orderFixture().offer;

        const toCents = (s: string) => Math.round(Number(s.replace(/[^\d,-]/g, "").replace(",", ".")) * 100);
        expect(data.items.reduce((sum, i) => sum + toCents(i.total), 0)).toBe(offer.net_amount);

        // Fixture: 10 × 10,00 € × 12 Monate = 1.200 €, 3 Freimonate = −300 €,
        // Pauschale +100 €, Rabatt −100 € → net_amount 900 €.
        expect(data.netTotal).toBe(eur(offer.net_amount));
        expect(data.netTotal).toBe("900,00 €");

        const line = data.items[0]!;
        expect(line.unitPrice).toBe("10,00 €");
        expect(line.gross).toBe("1.200,00 €");
        expect(line.discount).toBe("-300,00 €");
        expect(line.total).toBe("900,00 €");
    });

    it("numbers positions, flat rates and discounts as one list", async () => {
        const data = invoiceContract.parse((await buildInvoice("inv-1")).data);
        const order = presentOrder(fixture());
        expect(data.items.map((i) => i.pos)).toEqual([1, 2, 3]);
        expect(data.items.map((i) => i.total)).toEqual(["900,00 €", "100,00 €", eur(-order.discounts[0]!.amount_cents)]);
        expect(data.items[0]).not.toHaveProperty("articleNumber");
    });

    it("adds VAT, due date, service period and confirmation number", async () => {
        const built = await buildInvoice("inv-1");
        const data = invoiceContract.parse(built.data);

        expect(data.vatRate).toBe("19,00 %");
        expect(data.vatAmount).toBe("171,00 €");
        expect(data.grossTotal).toBe("1.071,00 €");

        expect(data.dueDate).toBe("05. November 2026");          // 06.10. + 30 Tage
        expect(data.servicePeriodFrom).toBe("01. November 2026");
        expect(data.servicePeriodTo).toBe("31. Oktober 2027");    // + 12 Monate − 1 Tag
        expect(data.confirmationNumber).toBe("000042");
        expect(data.customer.fullName).toBe("First Last");
        expect(built.displayName).toBe("2026-0007_RE_OriginalLtd");
    });
});

describe("paymentTermDays", () => {
    it.each([["30 Tage", 30], ["14 days", 14], ["sofort", null], ["", null]])("%s → %s", (term, days) => {
        expect(paymentTermDays(term)).toBe(days);
    });
});
