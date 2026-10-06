import { describe, expect, it, vi } from "vitest";
import { orderFixture } from "../../test/order-fixtures.js";
import { presentOrder } from "../../services/order-source.js";
import { formatOrderData, withPurchasePrices } from "./actions.js";
import { formatEur } from "../../utils/utils.js";

/**
 * Zwei Preisseiten an einer Bestellung. Die Bestellung (BE) geht an den
 * Zulieferer und zeigt Einkaufspreise; Auftragsbestätigung und Rechnung gehen
 * an den Kunden und dürfen Einkaufswerte nie enthalten.
 */

const PURCHASE = 700; // Cent je User/Monat, Verkauf im Fixture: 1000
const withPurchase = () => ({
    ...orderFixture(),
    positions: [{
        id: "op", orderId: "order", offerPositionId: "position",
        purchase_eur_user_month: PURCHASE,
        purchase_total_cents: PURCHASE * 10 * 12,
        purchase_discount_cents: PURCHASE * 10 * 3,
        createdAt: new Date(), updatedAt: new Date(),
    }],
});
const eur = (cents: number) => formatEur(cents / 100);

vi.mock("../../lib/prismaClient.js", () => ({
    prisma: {
        confirmation: { findUniqueOrThrow: vi.fn(async () => ({ id: "c", confirmationId: "1", date: new Date(), orderId: "order" })) },
        invoice: { findUniqueOrThrow: vi.fn(async () => ({ id: "i", invoiceId: "1", date: new Date(), orderId: "order" })) },
    },
}));
vi.mock("../../services/order.service.js", () => ({
    getOrderById: vi.fn(async () => presentOrder(withPurchase())),
}));

describe("presentOrder", () => {
    it("keeps customer prices untouched and adds the supplier side", () => {
        const order = presentOrder(withPurchase());
        const legacy = presentOrder(orderFixture());

        expect(order.net_amount).toBe(legacy.net_amount);
        expect(order.orderPositions).toEqual(legacy.orderPositions);

        expect(order.supplierPositions).toEqual([expect.objectContaining({
            offerPositionId: "position",
            eur_user_month: 1000,
            purchase_eur_user_month: PURCHASE,
            fallback: false,
        })]);
        expect(order.purchase_net_amount).toBe(PURCHASE * 10 * 12 - PURCHASE * 10 * 3);
    });

    it("falls back to the sales price for orders created before purchase prices existed", () => {
        const legacy = presentOrder(orderFixture());
        expect(legacy.supplierPositions[0]).toMatchObject({ purchase_eur_user_month: 1000, fallback: true });
        expect(legacy.purchase_net_amount).toBe(120000 - 30000);
    });
});

describe("Bestellung (BE) an den Zulieferer", () => {
    it("shows purchase prices instead of sales prices", async () => {
        const order = presentOrder(withPurchase());
        const customerSide = await formatOrderData({ order });
        const supplierSide = withPurchasePrices(customerSide, order);

        expect(supplierSide.total).toBe(eur(order.purchase_net_amount));
        expect(supplierSide.groups[0]!.items[0]!.price).toEqual({
            total: eur(PURCHASE * 10 * 12 - PURCHASE * 10 * 3),
            unit: eur(PURCHASE),
        });
        expect(supplierSide.customerTotal).toBe(customerSide.total);
        // Pauschalen bleiben Kundenpreise — es gibt keinen Einkaufspreis dafür.
        expect(supplierSide.flatrates).toEqual(customerSide.flatrates);
    });
});

describe("Kundendokumente", () => {
    const purchaseMarkers = [eur(PURCHASE), eur(PURCHASE * 10 * 12 - PURCHASE * 10 * 3)];

    it("Auftragsbestätigung enthält keine Einkaufswerte", async () => {
        const { buildConfirmation } = await import("../confirmation/build-confirmation.js");
        const text = JSON.stringify((await buildConfirmation("c")).data);
        for (const marker of purchaseMarkers) expect(text).not.toContain(marker);
        expect(text).toContain(eur(presentOrder(withPurchase()).net_amount));
    });

    it("Rechnung enthält keine Einkaufswerte", async () => {
        const { buildInvoice } = await import("../invoice/build-invoice.js");
        const text = JSON.stringify((await buildInvoice("i")).data);
        for (const marker of purchaseMarkers) expect(text).not.toContain(marker);
    });
});
