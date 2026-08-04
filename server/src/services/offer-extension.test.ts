import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    offerFindUnique: vi.fn(),
    offerPositionFindUnique: vi.fn(),
    tariffVersionFindUnique: vi.fn(),
    tariffCustomerPriceFindMany: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offer: { findUnique: mocks.offerFindUnique },
        offerPosition: { findUnique: mocks.offerPositionFindUnique },
        tariffVersion: { findUnique: mocks.tariffVersionFindUnique },
        tariffCustomerPrice: { findMany: mocks.tariffCustomerPriceFindMany },
    },
}));

// Zieht sonst bullmq/Redis beim Import hoch.
vi.mock("./document-generation-request.service.js", () => ({
    requestOfferGeneration: vi.fn(),
}));

import { AppException } from "../lib/exceptions.js";
import { getExtensionPrice } from "./offer.service.js";

/**
 * Eingefrorene Preistabelle: 12 Monate Laufzeit, zwei Mengenstaffeln
 * (1–10 → 100 ct/Seat/Monat, 11–50 → 90 ct). Bewusst nach oben begrenzt,
 * damit der NO_ROW-Fall prüfbar bleibt.
 */
const SNAPSHOT = {
    columns: [{ duration: 12 }],
    rows: [
        { min_quantity: 1, max_quantity: 10 },
        { min_quantity: 11, max_quantity: 50 },
    ],
    cells: [
        { duration: 12, min_quantity: 1, price: 100 },
        { duration: 12, min_quantity: 11, price: 90 },
    ],
};

function givenPosition(overrides: Record<string, unknown> = {}) {
    mocks.offerFindUnique.mockResolvedValue({ customerId: "cust-1" });
    mocks.offerPositionFindUnique.mockResolvedValue({
        id: "pos-1",
        offerId: "offer-1",
        productId: "prod-1",
        contractId: "contract-1",
        duration_months: 12,
        free_months: 0,
        eur_user_month: 100,
        tariffVersionId: "tv-1",
        ...overrides,
    });
    mocks.tariffVersionFindUnique.mockResolvedValue({
        tariffId: "tariff-1",
        snapshot: SNAPSHOT,
        snapshotVersion: 1,
    });
    mocks.tariffCustomerPriceFindMany.mockResolvedValue([]);
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("getExtensionPrice", () => {
    it("rechnet mit dem eingefrorenen Stückpreis, nicht mit dem Live-Tarif", async () => {
        givenPosition();

        const price = await getExtensionPrice("offer-1", "pos-1", 5);

        // 1–10 → 100 ct * 5 Seats * 12 Monate
        expect(price).toEqual({
            eur_user_month: 100,
            total_cents: 100 * 5 * 12,
            discount_cents: 0,
            fromSnapshot: true,
        });
        // Der Live-Tarif wird auf diesem Pfad gar nicht erst geladen.
        expect(mocks.tariffVersionFindUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: "tv-1" } }),
        );
    });

    it("greift bei erhöhter Menge die richtige Staffel der eingefrorenen Tabelle", async () => {
        givenPosition();

        const price = await getExtensionPrice("offer-1", "pos-1", 20);

        // 11–50 → 90 ct, nicht der Stückpreis der Quellposition (100)
        expect(price.eur_user_month).toBe(90);
        expect(price.total_cents).toBe(90 * 20 * 12);
    });

    it("wendet den aktuellen Kundenpreis auf die Koordinate an", async () => {
        givenPosition();
        mocks.tariffCustomerPriceFindMany.mockResolvedValue([
            { customerId: "cust-1", productId: null, duration: 12, min_quantity: 11, price: 70 },
        ]);

        const price = await getExtensionPrice("offer-1", "pos-1", 20);

        expect(price.eur_user_month).toBe(70);
        expect(mocks.tariffCustomerPriceFindMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", customerId: "cust-1" },
        });
    });

    it("leitet discount_cents aus den Freimonaten der Quellposition ab", async () => {
        givenPosition({ free_months: 2 });

        const price = await getExtensionPrice("offer-1", "pos-1", 5);

        expect(price.discount_cents).toBe(100 * 5 * 2);
    });

    it("meldet 422, wenn die Menge ausserhalb aller eingefrorenen Staffeln liegt", async () => {
        givenPosition();

        await expect(getExtensionPrice("offer-1", "pos-1", 500)).rejects.toMatchObject({
            statusCode: 422,
            code: "PRICE_CALCULATION_FAILED",
        });
    });

    it("fällt ohne Pin flach auf den gespeicherten Stückpreis zurück", async () => {
        givenPosition({ tariffVersionId: null });

        const price = await getExtensionPrice("offer-1", "pos-1", 20);

        // Ohne eingefrorene Tabelle ist die Staffel unbekannt — 100 statt 90.
        expect(price).toEqual({
            eur_user_month: 100,
            total_cents: 100 * 20 * 12,
            discount_cents: 0,
            fromSnapshot: false,
        });
        expect(mocks.tariffVersionFindUnique).not.toHaveBeenCalled();
    });

    it("lehnt eine Position ab, die zu einem anderen Angebot gehört", async () => {
        givenPosition({ offerId: "ein-anderes-angebot" });

        await expect(getExtensionPrice("offer-1", "pos-1", 5)).rejects.toMatchObject({
            statusCode: 422,
            code: "OFFER_POSITION_NOT_FOUND",
        });
    });

    it("weist ungültige Mengen ab, bevor irgendetwas geladen wird", async () => {
        givenPosition();

        await expect(getExtensionPrice("offer-1", "pos-1", 0)).rejects.toBeInstanceOf(AppException);
        await expect(getExtensionPrice("offer-1", "pos-1", 1.5)).rejects.toBeInstanceOf(AppException);
        expect(mocks.offerFindUnique).not.toHaveBeenCalled();
    });

    it("lehnt ein unbekanntes Snapshot-Format ab, statt still falsch zu rechnen", async () => {
        givenPosition();
        mocks.tariffVersionFindUnique.mockResolvedValue({
            tariffId: "tariff-1",
            snapshot: SNAPSHOT,
            snapshotVersion: 99,
        });

        await expect(getExtensionPrice("offer-1", "pos-1", 5)).rejects.toMatchObject({
            statusCode: 422,
            code: "UNSUPPORTED_SNAPSHOT_VERSION",
        });
    });
});
