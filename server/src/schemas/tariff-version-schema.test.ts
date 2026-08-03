import { describe, expect, it } from "vitest";

import { selectPrice, type TariffForPricing } from "../utils/products.js";
import {
    buildTariffVersionSnapshot,
    hashTariffSnapshot,
    tariffFromSnapshot,
    type TariffForSnapshot,
} from "./tariff-version-schema.js";

/**
 * Tarif mit zwei Laufzeiten (12/24 Monate) und zwei Mengenstaffeln
 * (1–10 → 100 ct, 11–offen → 90 ct). rowLarge/col24 ist bewusst nicht
 * konfiguriert, damit der NO_CELL-Pfad abgedeckt bleibt.
 */
function buildTariff(overrides?: { smallPrice?: number; largePrice?: number }): TariffForSnapshot {
    const smallPrice = overrides?.smallPrice ?? 100;
    const largePrice = overrides?.largePrice ?? 90;

    return {
        columns: [
            { id: "col12", duration: 12 },
            { id: "col24", duration: 24 },
        ],
        rows: [
            { id: "rowSmall", min_quantity: 1, max_quantity: 10 },
            { id: "rowLarge", min_quantity: 11, max_quantity: null },
        ],
        cells: [
            { rowId: "rowSmall", columnId: "col12", default_cells: [{ price: smallPrice }] },
            { rowId: "rowSmall", columnId: "col24", default_cells: [{ price: smallPrice - 5 }] },
            { rowId: "rowLarge", columnId: "col12", default_cells: [{ price: largePrice }] },
        ],
    };
}

/** Dieselbe Tabelle in der Form, die selectPrice live bekommt. */
function asLiveTariff(tariff: TariffForSnapshot, customerPrices: TariffForPricing["customerPrices"] = []): TariffForPricing {
    return {
        columns: tariff.columns,
        rows: tariff.rows,
        cells: tariff.cells.map((cell, index) => ({ id: `cell${index}`, ...cell })),
        customerPrices,
    };
}

describe("buildTariffVersionSnapshot", () => {
    it("normalisiert unabhängig von der Eingabereihenfolge", () => {
        const tariff = buildTariff();
        const shuffled: TariffForSnapshot = {
            columns: [...tariff.columns].reverse(),
            rows: [...tariff.rows].reverse(),
            cells: [...tariff.cells].reverse(),
        };

        expect(buildTariffVersionSnapshot(shuffled)).toEqual(buildTariffVersionSnapshot(tariff));
    });

    it("übernimmt Zellen ohne Default-Preis als price: null", () => {
        const tariff = buildTariff();
        tariff.cells[0].default_cells = [];

        const snapshot = buildTariffVersionSnapshot(tariff);
        const cell = snapshot.cells.find((c) => c.duration === 12 && c.min_quantity === 1);

        expect(cell?.price).toBeNull();
    });

    it("überspringt verwaiste Zellen ohne passende Zeile oder Spalte", () => {
        const tariff = buildTariff();
        tariff.cells.push({ rowId: "gone", columnId: "col12", default_cells: [{ price: 1 }] });

        expect(buildTariffVersionSnapshot(tariff).cells).toHaveLength(3);
    });
});

describe("hashTariffSnapshot", () => {
    it("ist stabil gegen die Eingabereihenfolge", () => {
        const tariff = buildTariff();
        const shuffled: TariffForSnapshot = {
            columns: [...tariff.columns].reverse(),
            rows: [...tariff.rows].reverse(),
            cells: [...tariff.cells].reverse(),
        };

        expect(hashTariffSnapshot(buildTariffVersionSnapshot(shuffled)))
            .toBe(hashTariffSnapshot(buildTariffVersionSnapshot(tariff)));
    });

    it("ist unabhängig von den Datenbank-Ids — ein Restore erzeugt denselben Hash", () => {
        const original = buildTariffVersionSnapshot(buildTariff());

        // Restore legt Zeilen/Spalten/Zellen mit frischen cuids neu an.
        const afterRestore = buildTariffVersionSnapshot({
            columns: [{ id: "neu-a", duration: 12 }, { id: "neu-b", duration: 24 }],
            rows: [
                { id: "neu-c", min_quantity: 1, max_quantity: 10 },
                { id: "neu-d", min_quantity: 11, max_quantity: null },
            ],
            cells: [
                { rowId: "neu-c", columnId: "neu-a", default_cells: [{ price: 100 }] },
                { rowId: "neu-c", columnId: "neu-b", default_cells: [{ price: 95 }] },
                { rowId: "neu-d", columnId: "neu-a", default_cells: [{ price: 90 }] },
            ],
        });

        expect(hashTariffSnapshot(afterRestore)).toBe(hashTariffSnapshot(original));
    });

    it("ändert sich, sobald ein Preis abweicht", () => {
        const before = hashTariffSnapshot(buildTariffVersionSnapshot(buildTariff()));
        const after = hashTariffSnapshot(buildTariffVersionSnapshot(buildTariff({ smallPrice: 200 })));

        expect(after).not.toBe(before);
    });
});

describe("tariffFromSnapshot → selectPrice", () => {
    it("liefert dasselbe Ergebnis wie selectPrice auf der Live-Tabelle", () => {
        const tariff = buildTariff();
        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(tariff));

        for (const [duration, quantity] of [[12, 5], [12, 20], [24, 5], [24, 20], [12, 9999]]) {
            expect(selectPrice(hydrated, { duration, quantity }))
                .toEqual(selectPrice(asLiveTariff(tariff), { duration, quantity }));
        }
    });

    it("löst die Mengenstaffel im eingefrorenen Tarif korrekt auf", () => {
        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(buildTariff()));

        const small = selectPrice(hydrated, { duration: 12, quantity: 5 });
        const large = selectPrice(hydrated, { duration: 12, quantity: 20 });

        expect(small.ok && small.breakdown.unitPrice).toBe(100);
        expect(large.ok && large.breakdown.unitPrice).toBe(90);
    });

    it("hält den alten Preis, obwohl der Live-Tarif teurer geworden ist", () => {
        // Kern der Preisgarantie: Snapshot bei 100/90 eingefroren, danach
        // Tarif auf 200/180 erhöht. Eine Mengenerhöhung von 5 auf 20 Seats
        // muss die alte Staffel treffen — 90, nicht 180.
        const frozen = tariffFromSnapshot(buildTariffVersionSnapshot(buildTariff()));
        const live = asLiveTariff(buildTariff({ smallPrice: 200, largePrice: 180 }));

        const frozenResult = selectPrice(frozen, { duration: 12, quantity: 20 });
        const liveResult = selectPrice(live, { duration: 12, quantity: 20 });

        expect(frozenResult).toEqual({
            ok: true,
            price: 90 * 20 * 12,
            breakdown: { unitPrice: 90, quantity: 20, duration: 12, freeMonths: 0, effectiveDuration: 12 },
        });
        expect(liveResult.ok && liveResult.breakdown.unitPrice).toBe(180);
    });

    it("meldet NO_ROW, wenn die Menge außerhalb aller eingefrorenen Staffeln liegt", () => {
        const tariff = buildTariff();
        tariff.rows[1].max_quantity = 50;

        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(tariff));

        expect(selectPrice(hydrated, { duration: 12, quantity: 500 }))
            .toEqual({ ok: false, reason: "NO_ROW" });
    });

    it("unterscheidet NO_CELL von NO_DEFAULT", () => {
        const tariff = buildTariff();
        // rowLarge/col24 existiert gar nicht → NO_CELL
        expect(selectPrice(tariffFromSnapshot(buildTariffVersionSnapshot(tariff)), { duration: 24, quantity: 20 }))
            .toEqual({ ok: false, reason: "NO_CELL" });

        // rowSmall/col12 existiert, hat aber keinen Preis → NO_DEFAULT
        tariff.cells[0].default_cells = [];
        expect(selectPrice(tariffFromSnapshot(buildTariffVersionSnapshot(tariff)), { duration: 12, quantity: 5 }))
            .toEqual({ ok: false, reason: "NO_DEFAULT" });
    });

    it("wendet eingefrorene Kundenpreise über die Koordinaten an", () => {
        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(buildTariff()), [
            { customerId: "vip", productId: null, duration: 12, min_quantity: 11, price: 70 },
        ]);

        const result = selectPrice(hydrated, { duration: 12, quantity: 20, customerId: "vip" });

        expect(result.ok && result.breakdown.unitPrice).toBe(70);
    });

    it("lässt produktspezifische Overrides gruppenweite schlagen", () => {
        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(buildTariff()), [
            { customerId: "vip", productId: null, duration: 12, min_quantity: 1, price: 70 },
            { customerId: "vip", productId: "prod-a", duration: 12, min_quantity: 1, price: 60 },
        ]);

        const specific = selectPrice(hydrated, { productId: "prod-a", duration: 12, quantity: 5, customerId: "vip" });
        const groupWide = selectPrice(hydrated, { productId: "prod-b", duration: 12, quantity: 5, customerId: "vip" });

        expect(specific.ok && specific.breakdown.unitPrice).toBe(60);
        expect(groupWide.ok && groupWide.breakdown.unitPrice).toBe(70);
    });

    it("ignoriert Overrides, deren Koordinate nicht zur gewählten Zelle gehört", () => {
        const hydrated = tariffFromSnapshot(buildTariffVersionSnapshot(buildTariff()), [
            // Override gilt für die große Staffel, angefragt wird die kleine.
            { customerId: "vip", productId: null, duration: 12, min_quantity: 11, price: 70 },
        ]);

        const result = selectPrice(hydrated, { duration: 12, quantity: 5, customerId: "vip" });

        expect(result.ok && result.breakdown.unitPrice).toBe(100);
    });
});
