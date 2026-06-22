import {describe, expect, it} from "vitest";
import {formatOfferData} from "../actions.js";
import type {OfferFetchData} from "../context.js";

/**
 * Builds a minimal `OfferFetchData` fixture that mirrors the relevant shape of
 * the Prisma query result consumed by `formatOfferData`. Only the fields the
 * formatter reads are populated; the cast keeps the fixture readable without
 * reproducing the full generated Prisma types.
 */
function buildFetchData(overrides?: {
    positions?: Array<{
        contractId: string;
        duration_months: number;
        total_cents: number;
        quantity: number;
        optional?: boolean;
        productName?: string;
    }>;
    flatRates?: Array<{ total_cents: number; name?: string }>;
}): OfferFetchData {
    const positions = overrides?.positions ?? [
        {
            contractId: "c1",
            duration_months: 12,
            total_cents: 120000,
            quantity: 10,
            productName: "Backup",
        },
    ];

    const offer = {
        id: "offer1",
        quoteId: "Q-2024-001",
        date: new Date(2024, 0, 15),
        paymentTerm: 30,
        validUntil: new Date(2024, 1, 15),
        requestFrom: null,
        supplierId: "sup1",
        language: "DE",
        customer: {
            customerId: "K-100",
            companyName: "ACME GmbH",
            street: "Hauptstr. 1",
            plz: "12345",
            city: "Berlin",
            phone: "030-123",
            email: "info@acme.test",
        },
        customerContactPerson: {
            salutation: "Herr",
            firstName: "Max",
            lastName: "Mustermann",
        },
        user: {
            salutation: "Frau",
            firstName: "Erika",
            lastName: "Musterfrau",
            phone: "030-999",
            email: "erika@keepit.test",
        },
        offerPositions: positions.map((p, i) => ({
            id: `pos${i}`,
            duration_months: p.duration_months,
            total_cents: p.total_cents,
            quantity: p.quantity,
            optional: p.optional ?? false,
            product: {
                id: `prod${i}`,
                translations: [
                    {
                        language: "DE",
                        name: p.productName ?? "Produkt",
                        description: "Beschreibung",
                        table: "",
                    },
                ],
            },
            contract: {
                id: p.contractId,
                translations: [
                    {language: "DE", name: "Standard", features: ["f1"], table: ""},
                ],
            },
        })),
        offerFlatRates: (overrides?.flatRates ?? []).map((fr, i) => ({
            id: `fr${i}`,
            total_cents: fr.total_cents,
            flatRate: {
                id: `flat${i}`,
                translations: [
                    {language: "DE", name: fr.name ?? "Pauschale", table: ""},
                ],
            },
        })),
    };

    return {offer, contracts: []} as unknown as OfferFetchData;
}

describe("formatOfferData", () => {
    it("formatiert Stammdaten von Angebot, Kunde und Mitarbeiter", async () => {
        const result = await formatOfferData(buildFetchData());

        expect(result.quoteId).toBe("Q-2024-001");
        expect(result.date).toBe("15. Januar 2024");
        expect(result.validUntil).toBe("15. Februar 2024");
        expect(result.requestFrom).toBe("");
        expect(result.customer.companyName).toBe("ACME GmbH");
        expect(result.customer.fullName).toBe("Herr Max Mustermann");
        expect(result.employee.fullName).toBe("Frau Erika Musterfrau");
    });

    it("berechnet Gruppensumme und Einzelpreis korrekt", async () => {
        const result = await formatOfferData(
            buildFetchData({
                positions: [
                    {
                        contractId: "c1",
                        duration_months: 12,
                        total_cents: 120000,
                        quantity: 10,
                        productName: "Backup",
                    },
                ],
            }),
        );

        expect(result.products.grouped).toHaveLength(1);
        const group = result.products.grouped[0];
        // 120000 Cent / 100 = 1.200,00 €
        expect(group.total).toBe("1.200,00 €");
        // Einzelpreis: 120000 / 10 / 12 / 100 = 10,00 €
        expect(group.items?.[0].price.unit).toBe("10,00 €");
        expect(group.items?.[0].price.total).toBe("1.200,00 €");
    });

    it("gruppiert Positionen nach Vertrag und Laufzeit", async () => {
        const result = await formatOfferData(
            buildFetchData({
                positions: [
                    {contractId: "c1", duration_months: 12, total_cents: 1000, quantity: 1, productName: "A"},
                    {contractId: "c1", duration_months: 12, total_cents: 2000, quantity: 1, productName: "B"},
                    {contractId: "c2", duration_months: 24, total_cents: 3000, quantity: 1, productName: "C"},
                ],
            }),
        );

        expect(result.products.grouped).toHaveLength(2);
        const first = result.products.grouped.find((g) => g.names === "A & B");
        expect(first?.total).toBe("30,00 €"); // (1000 + 2000) / 100
    });

    it("schützt den Einzelpreis vor Division durch null", async () => {
        const result = await formatOfferData(
            buildFetchData({
                positions: [
                    {
                        contractId: "c1",
                        duration_months: 0,
                        total_cents: 0,
                        quantity: 0,
                        productName: "Frei",
                    },
                ],
            }),
        );

        expect(result.products.grouped[0].items?.[0].price.unit).toBe("0,00 €");
    });

    it("formatiert Flatrates", async () => {
        const result = await formatOfferData(
            buildFetchData({flatRates: [{total_cents: 5000, name: "Support"}]}),
        );

        expect(result.flatRates).toHaveLength(1);
        expect(result.flatRates[0].price.total).toBe("50,00 €");
    });
});
