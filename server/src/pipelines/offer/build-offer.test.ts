import { beforeEach, describe, expect, it, vi } from "vitest";

const calculatePrice = vi.fn();

vi.mock("@/lib/prismaClient.js", () => ({ prisma: {} }));
vi.mock("@/utils/products.js", () => ({
    calculatePrice: (...args: unknown[]) => calculatePrice(...args),
}));

const { formatOfferData, buildOfferDocument } = await import("./build-offer.js");
const { computeOfferModel } = await import("./compute-offer.js");
const { presentOffer, withNumberPrefixes } = await import("./present-offer.js");
const { offerFixture: fixture } = await import("./offer.fixture.js");
const { serializeAcceptedOfferSnapshot } = await import("../../schemas/accepted-offer.js");

describe("formatOfferData", () => {
    beforeEach(() => {
        calculatePrice.mockReset().mockImplementation(async ({ productId, contractId }: { productId: string; contractId: string }) =>
            contractId === "c-broken"
                ? { ok: false }
                : { ok: true, breakdown: { unitPrice: (productId === "prod-1" ? 700 : 400) } });
    });

    it("Deutsch mit Vergleich", async () => {
        expect(await formatOfferData(fixture())).toMatchSnapshot();
    });

    it("Englisch ohne Vergleich", async () => {
        expect(await formatOfferData(fixture({ language: "EN", featureComparison: false }))).toMatchSnapshot();
    });

    it("lässt eine Vergleichstabelle weg, wenn ein Preis fehlt, nicht aber die Gruppe", async () => {
        const result = await formatOfferData(fixture());

        expect(result.tables.map((table) => table.contract)).toEqual(["Basic", "Plus"]);
        expect(result.groups.map((group) => group.contract)).toEqual(["Basic", "Plus", "Broken"]);
    });
});

describe("Angebotsmodell", () => {
    beforeEach(() => {
        calculatePrice.mockReset().mockImplementation(async ({ contractId }: { contractId: string }) =>
            contractId === "c-broken" ? { ok: false } : { ok: true, breakdown: { unitPrice: 700 } });
    });

    it("enthält Rohwerte und übersteht JSON unverändert", async () => {
        const model = await computeOfferModel(fixture());

        expect(JSON.parse(JSON.stringify(model))).toEqual(model);
        expect(model.validUntil).toBe("2026-11-01T12:00:00.000Z");
        // Haupttabelle netto: (120000 - 10000) + 36000, dazu Flatrate 25000, minus Rabatt 5000.
        expect(model.tables[0]).toMatchObject({ contractId: "c-base", total_cents: 166000 });
        expect(model.tables.map((table) => table.contractId)).toEqual(["c-base", "c-plus"]);
        expect(model.comparisonContracts.map((c) => c.id)).toEqual(["c-plus", "c-broken"]);
    });

    it("stellt ein gespeichertes Modell identisch dar, ohne neu zu rechnen", async () => {
        const model = await computeOfferModel(fixture());
        const calls = calculatePrice.mock.calls.length;

        const restored = JSON.parse(JSON.stringify(model));

        expect(presentOffer(restored)).toEqual(presentOffer(model));
        expect(calculatePrice.mock.calls.length).toBe(calls);
    });

    it("stellt dasselbe Modell in der Sprache des Angebots dar und meldet fehlende Übersetzungen klar", async () => {
        const model = await computeOfferModel(fixture({ featureComparison: false }));
        model.contract.translations = [];

        expect(() => presentOffer(model)).toThrow(/No translation available for contract c-base/);
    });
});

describe("angenommenes Angebot", () => {
    beforeEach(() => {
        calculatePrice.mockReset().mockImplementation(async ({ contractId }: { contractId: string }) =>
            contractId === "c-broken" ? { ok: false } : { ok: true, breakdown: { unitPrice: 700 } });
    });

    const iso = (s: string) => new Date(`${s}T12:00:00.000Z`);
    const timestamps = { createdAt: iso("2026-01-01"), updatedAt: iso("2026-01-01") };

    function frozenCommercialSource() {
        return {
            supplierId: "SUP-1",
            customerId: "cust-1",
            contactPersonId: "contact-1",
            employeeId: "user-1",
            contractId: "c-base",
            duration_months: 24,
            paymentTerm: "30 Tage",
            language: "DE" as const,
            validUntil: iso("2026-11-01"),
            requestFrom: iso("2026-09-15"),
            net_amount: 166000,
            customer: {
                id: "cust-1", customerId: "K-100", companyName: "Frozen Corp GmbH", language: "DE" as const,
                email: "info@frozen.test", invoiceEmail: "billing@frozen.test", phone: "030 1",
                street: "Weg 1", city: "Berlin", zip: "12345", country: "DE", currency: "EUR" as const,
                taxRate: 19, salutation: null, ...timestamps,
            },
            customerContactPerson: {
                id: "contact-1", customerId: "cust-1", salutation: "Frau", firstName: "Anna", lastName: "Muster",
                email: "anna@frozen.test", ...timestamps,
            },
            employee: {
                id: "user-1", name: "Max Verkauf", salutation: "Herr", firstName: "Max", lastName: "Verkauf",
                email: "max@keepit.test", phone: null, ...timestamps,
            },
            contract: {
                id: "c-base",
                translations: [
                    { language: "DE" as const, name: "Basic", features: ["Backup"], table: "" },
                    { language: "EN" as const, name: "Basic", features: ["Backup"], table: "" },
                ],
                ...timestamps,
            },
            positions: [
                {
                    id: "p-1", productId: "prod-1",
                    product: {
                        id: "prod-1",
                        translations: [
                            { language: "DE" as const, name: "Legacy Product", description: "M365", table: "Tabelle M365" },
                            { language: "EN" as const, name: "Legacy Product", description: null, table: null },
                        ],
                        ...timestamps,
                    },
                    quantity: 10, optional: false, total_cents: 120000, discount_cents: 10000, free_months: 2,
                    eur_user_month: 500, ...timestamps,
                },
                {
                    id: "p-2", productId: "prod-2",
                    product: {
                        id: "prod-2",
                        translations: [
                            { language: "DE" as const, name: "Salesforce", description: null, table: null },
                            { language: "EN" as const, name: "Salesforce", description: null, table: null },
                        ],
                        ...timestamps,
                    },
                    quantity: 5, optional: true, total_cents: 36000, discount_cents: 0, free_months: 0,
                    eur_user_month: 300, ...timestamps,
                },
            ],
            flatRates: [
                {
                    id: "fr-1", flatRateId: "flatrate-1",
                    flatRate: {
                        id: "flatrate-1", total_cents: 25000,
                        translations: [
                            { language: "DE" as const, name: "Setup", description: null, table: "Setup-Tabelle" },
                            { language: "EN" as const, name: "Setup", description: null, table: "Setup table" },
                        ],
                        ...timestamps,
                    },
                    quantity: 1, total_cents: 25000,
                },
            ],
            discounts: [
                { id: "disc-1", title: "Treuerabatt", description: null, amount_cents: 5000, ...timestamps },
            ],
        };
    }

    async function acceptedSnapshotFixture() {
        const frozenTemplateBasis = fixture({ customerCompanyName: "Frozen Corp GmbH", productName: "Legacy Product" });
        const offerTemplate = await formatOfferData(frozenTemplateBasis);
        return serializeAcceptedOfferSnapshot(frozenCommercialSource(), offerTemplate);
    }

    it("stellt den Dateinamen aus dem eingefrorenen Snapshot dar, nicht aus dem aktuellen Stand", async () => {
        const acceptedSnapshot = await acceptedSnapshotFixture();
        const renamed = fixture({ acceptedSnapshot, customerCompanyName: "Renamed Corp AG", productName: "New Product Name" });

        const built = await buildOfferDocument(renamed, 0);

        expect(built.displayName).toContain("FrozenCorpGmbH");
        expect(built.displayName).toContain("LegacyProduct");
        expect(built.displayName).not.toContain("RenamedCorpAG");
        expect(built.displayName).not.toContain("NewProductName");
    });

    it("stellt den Dateinamen aus dem aktuellen Stand dar, wenn kein Snapshot existiert", async () => {
        const live = fixture({ customerCompanyName: "Live Corp AG", productName: "Current Product" });

        const built = await buildOfferDocument(live, 0);

        expect(built.displayName).toContain("LiveCorpAG");
        expect(built.displayName).toContain("CurrentProduct");
    });
});

describe("Nummerierung der Offerten", () => {
    beforeEach(() => {
        calculatePrice.mockReset().mockResolvedValue({ ok: true, breakdown: { unitPrice: 700 } });
    });

    it("nummeriert Gruppen und Tabellen nur bei Vergleich", async () => {
        const compare = await formatOfferData(fixture());
        const single = await formatOfferData(fixture({ featureComparison: false }));

        expect(compare.groups.map((g) => g.numberPrefix)).toEqual(["1. ", "2. ", "3. "]);
        expect(compare.tables.map((t) => t.numberPrefix)).toEqual(["1. ", "2. ", "3. "]);
        expect(single.groups.map((g) => g.numberPrefix)).toEqual([""]);
        expect(single.tables.map((t) => t.numberPrefix)).toEqual([""]);
    });

    it("ergänzt eingefrorene Snapshots, die die Nummern noch nicht kennen", async () => {
        const live = await formatOfferData(fixture());
        const frozen = {
            ...live,
            groups: live.groups.map(({ numberPrefix: _unused, ...group }) => group),
            tables: live.tables.map(({ numberPrefix: _unused, ...table }) => table),
        } as unknown as typeof live;

        expect(withNumberPrefixes(frozen)).toEqual(live);
        expect(withNumberPrefixes(live)).toEqual(live);
    });
});
