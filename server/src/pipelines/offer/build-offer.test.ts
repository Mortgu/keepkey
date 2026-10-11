import { beforeEach, describe, expect, it, vi } from "vitest";

const calculatePrice = vi.fn();

vi.mock("@/lib/prismaClient.js", () => ({ prisma: {} }));
vi.mock("@/utils/products.js", () => ({
    calculatePrice: (...args: unknown[]) => calculatePrice(...args),
}));

const { formatOfferData } = await import("./build-offer.js");
const { computeOfferModel } = await import("./compute-offer.js");
const { presentOffer, withNumberPrefixes } = await import("./present-offer.js");
const { offerFixture: fixture } = await import("./offer.fixture.js");

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
