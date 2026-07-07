import { describe, expect, it } from "vitest";
import { formatOrderData, postprocessing } from "../actions.js";
import type { OrderFetchedData } from "../context.js";

function buildFetchData(overrides?: {
    positions?: Array<{
        contractId: string;
        duration_months: number;
        total_cents: number;
        quantity: number;
        productName?: string;
    }>;
    flatRates?: Array<{ total_cents: number; name?: string }>;
}): OrderFetchedData {
    const positions = overrides?.positions ?? [
        {
            contractId: "c1",
            duration_months: 12,
            total_cents: 120000,
            quantity: 10,
            productName: "Backup",
        },
    ];

    const order = {
        id: "order1",
        orderId: "AB-2024-001",
        date: new Date(2024, 0, 15),
        paymentTerm: 30,
        validUntil: null,
        requestFrom: null,
        supplierId: "sup1",
        customer: {
            customerId: "K-100",
            companyName: "ACME GmbH",
            street: "Hauptstr. 1",
            zip: "12345",
            city: "Berlin",
            phone: "030-123",
            email: "info@acme.test",
        },
        supplier: { id: "sup1" },
        customerContactPerson: {
            salutation: "Herr",
            firstName: "Max",
            lastName: "Mustermann",
        },
        employee: {
            salutation: "Frau",
            firstName: "Erika",
            lastName: "Musterfrau",
            phone: "030-999",
            email: "erika@keepit.test",
        },
        orderPositions: positions.map((p, i) => ({
            id: `pos${i}`,
            duration_months: p.duration_months,
            total_cents: p.total_cents,
            quantity: p.quantity,
            optional: false,
            product: {
                id: `prod${i}`,
                translations: [
                    { language: "DE", name: p.productName ?? "Produkt", description: "Beschreibung", table: "" },
                ],
            },
            contract: {
                id: p.contractId,
                translations: [
                    { language: "DE", name: "Standard", features: ["f1"], table: "" },
                ],
            },
        })),
        flatRates: (overrides?.flatRates ?? []).map((fr, i) => ({
            id: `fr${i}`,
            total_cents: fr.total_cents,
            flatRate: {
                id: `flat${i}`,
                translations: [{ language: "DE", name: fr.name ?? "Pauschale", table: "" }],
            },
        })),
    };

    return { order } as unknown as OrderFetchedData;
}

describe("formatOrderData", () => {
    it("wirft, wenn keine Daten übergeben werden", async () => {
        await expect(formatOrderData(undefined)).rejects.toThrow();
    });

    it("formatiert Stammdaten der Bestellung", async () => {
        const result = await formatOrderData(buildFetchData());

        expect(result.quoteId).toBe("AB-2024-001");
        expect(result.date).toBe("15. Januar 2024");
        expect(result.customer.fullName).toBe("Herr Max Mustermann");
        expect(result.employee.fullName).toBe("Frau Erika Musterfrau");
    });

    it("berechnet Gruppensumme inklusive Flatrates", async () => {
        const result = await formatOrderData(
            buildFetchData({
                positions: [
                    { contractId: "c1", duration_months: 12, total_cents: 10000, quantity: 1 },
                ],
                flatRates: [{ total_cents: 5000 }],
            }),
        );

        // Gruppensumme = Positionssumme (10000) + Flatrate-Summe (5000) = 15000 Cent
        expect(result.products.grouped[0].total).toBe("150,00 €");
    });

    it("schützt den Einzelpreis vor Division durch null", async () => {
        const result = await formatOrderData(
            buildFetchData({
                positions: [
                    { contractId: "c1", duration_months: 0, total_cents: 0, quantity: 0 },
                ],
            }),
        );

        const unit = result.products.grouped[0].items?.[0].price.unit;
        expect(unit).toBe("0,00 €");
        expect(unit).not.toContain("NaN");
    });
});

describe("postprocessing", () => {
    it("wirft, wenn keine formatierten Daten übergeben werden", async () => {
        await expect(postprocessing(undefined)).rejects.toThrow();
    });
});
