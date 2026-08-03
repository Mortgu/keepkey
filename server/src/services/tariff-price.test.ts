import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    tariffGroupProductFindUnique: vi.fn(),
    tariffFindUnique: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        tariffGroupProduct: { findUnique: mocks.tariffGroupProductFindUnique },
        tariff: { findUnique: mocks.tariffFindUnique },
    },
}));

import { getTariffPrice } from "./tariff.service.js";

/** Ein Tarif mit 12 Monaten Laufzeit und 100 ct/Seat/Monat. */
function givenTariff(customerPrices: Array<Record<string, unknown>> = []) {
    mocks.tariffGroupProductFindUnique.mockResolvedValue({ tariffGroupId: "group-1" });
    mocks.tariffFindUnique.mockResolvedValue({
        id: "tariff-1",
        columns: [{ id: "col-1", duration: 12 }],
        rows: [{ id: "row-1", min_quantity: 1, max_quantity: null }],
        cells: [{ id: "cell-1", rowId: "row-1", columnId: "col-1", default_cells: [{ price: 100 }] }],
        customerPrices,
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getTariffPrice", () => {
    it("liefert total_cents brutto und weist die Freimonate getrennt aus", async () => {
        givenTariff();

        const price = await getTariffPrice("prod-1", "contract-1", 12, 5, "cust-1", 2);

        // Brutto über die volle Laufzeit: 100 * 5 * 12.
        expect(price.total_cents).toBe(6000);
        // Wert der zwei Freimonate: 100 * 5 * 2.
        expect(price.discount_cents).toBe(1000);
        expect(price.eur_user_month).toBe(100);
    });

    it("meldet einen Live-Preis als nicht aus einem Snapshot stammend", async () => {
        givenTariff();

        const price = await getTariffPrice("prod-1", "contract-1", 12, 5, "cust-1", 0);

        expect(price.fromSnapshot).toBe(false);
        expect(price.discount_cents).toBe(0);
    });

    it("wendet einen kundenspezifischen Stückpreis an", async () => {
        givenTariff([
            { customerId: "cust-1", productId: "prod-1", duration: 12, min_quantity: 1, price: 80 },
        ]);

        const price = await getTariffPrice("prod-1", "contract-1", 12, 5, "cust-1", 0);

        expect(price.eur_user_month).toBe(80);
        expect(price.total_cents).toBe(4800);
    });

    it("weist mehr Freimonate als Laufzeit zurück", async () => {
        givenTariff();

        await expect(getTariffPrice("prod-1", "contract-1", 12, 5, "cust-1", 13))
            .rejects.toMatchObject({ code: "INVALID_INPUT" });
    });
});
