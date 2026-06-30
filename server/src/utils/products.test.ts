import { describe, it, expect } from "vitest";
import { selectPrice, PriceError, type TariffForPricing } from "./products.js";

/**
 * Tariff mit zwei Laufzeit-Spalten (12 / 24 Monate) und zwei Mengen-Zeilen
 * (1–10, 11–unbegrenzt). Default-Preis pro Zelle, plus ein Kunden-Override.
 *
 * `price` ist der Stückpreis pro Stück pro Zeiteinheit.
 * Gesamt = unitPrice * quantity * duration. `duration` selektiert die Spalte
 * und ist zusätzlich Multiplikator.
 */
function buildTariff(): TariffForPricing {
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
      {
        id: "cell1",
        rowId: "rowSmall",
        columnId: "col12",
        default_cells: [{ price: 10 }],
        customer_cells: [{ customerId: "vip", price: 8 }],
      },
      {
        id: "cell2",
        rowId: "rowSmall",
        columnId: "col24",
        default_cells: [{ price: 9 }],
        customer_cells: [],
      },
      {
        id: "cell3",
        rowId: "rowLarge",
        columnId: "col12",
        default_cells: [{ price: 5 }],
        customer_cells: [],
      },
    ],
  };
}

describe("selectPrice", () => {
  it("berechnet Preis = stückpreis * menge * dauer", () => {
    // rowSmall/col12 → 10 € * 5 Stück * 12 Monate = 600
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 5 });
    expect(result).toEqual({
      ok: true,
      price: 600,
      breakdown: { unitPrice: 10, quantity: 5, duration: 12 },
    });
  });

  it("wählt die richtige Zeile anhand der Mengen-Range", () => {
    // quantity 15 → rowLarge/col12 → 5 * 15 * 12 = 900
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.price).toBe(900);
  });

  it("behandelt offene Obergrenze (max_quantity = null)", () => {
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 9999 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.price).toBe(5 * 9999 * 12);
  });

  it("anderen duration selektiert die entsprechende Spalte", () => {
    // rowSmall/col24 → 9 € * 5 Stück * 24 Monate = 1080
    const result = selectPrice(buildTariff(), { duration: 24, quantity: 5 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.price).toBe(1080);
  });

  it("wendet einen Kunden-Override an, wenn vorhanden", () => {
    // vip → 8 statt 10 → 8 * 5 * 12 = 480
    const result = selectPrice(buildTariff(), {
      duration: 12,
      quantity: 5,
      customerId: "vip",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.price).toBe(480);
      expect(result.breakdown.unitPrice).toBe(8);
    }
  });

  it("nutzt den Default-Preis bei unbekanntem Kunden", () => {
    const result = selectPrice(buildTariff(), {
      duration: 12,
      quantity: 5,
      customerId: "unknown",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.price).toBe(600);
  });

  it("behandelt leeren customerId-String als 'kein Kunde' (Default-Preis)", () => {
    const result = selectPrice(buildTariff(), {
      duration: 12,
      quantity: 5,
      customerId: "",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.price).toBe(600);
  });

  it("gibt NO_COLUMN zurück, wenn keine Spalte zur Dauer passt", () => {
    const result = selectPrice(buildTariff(), { duration: 36, quantity: 5 });
    expect(result).toEqual({ ok: false, reason: "NO_COLUMN" });
  });

  it("gibt NO_ROW zurück, wenn keine Zeile zur Menge passt", () => {
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 0 });
    expect(result).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });

  it("gibt NO_ROW zurück, wenn Menge unterhalb aller min_quantity liegt", () => {
    // rowSmall startet bei min_quantity = 1; -5 ist INVALID_INPUT (quantity <= 0)
    const result = selectPrice(buildTariff(), { duration: 12, quantity: -5 });
    expect(result).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });

  it("gibt NO_CELL zurück, wenn keine passende Zelle existiert", () => {
    // rowLarge/col24 ist nicht definiert
    const result = selectPrice(buildTariff(), { duration: 24, quantity: 15 });
    expect(result).toEqual({ ok: false, reason: "NO_CELL" });
  });

  it("gibt NO_DEFAULT zurück, wenn kein Default-Preis hinterlegt ist", () => {
    const tariff = buildTariff();
    tariff.cells[0].default_cells = [];
    const result = selectPrice(tariff, { duration: 12, quantity: 5 });
    expect(result).toEqual({ ok: false, reason: "NO_DEFAULT" });
  });

  it("gibt NO_TARIFF zurück bei fehlendem Tarif", () => {
    expect(selectPrice(null, { duration: 12, quantity: 5 })).toEqual({
      ok: false,
      reason: "NO_TARIFF",
    });
    expect(selectPrice(undefined, { duration: 12, quantity: 5 })).toEqual({
      ok: false,
      reason: "NO_TARIFF",
    });
  });

  it("gibt INVALID_INPUT zurück bei negativer Menge", () => {
    const result = selectPrice(buildTariff(), { duration: 12, quantity: -1 });
    expect(result).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });

  it("gibt INVALID_INPUT zurück bei nicht-ganzzahliger Menge", () => {
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 1.5 });
    expect(result).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });

  it("gibt INVALID_INPUT zurück bei quantity = 0", () => {
    const result = selectPrice(buildTariff(), { duration: 12, quantity: 0 });
    expect(result).toEqual({ ok: false, reason: "INVALID_INPUT" });
  });
});

describe("PriceError", () => {
  it("enthält die reason-Eigenschaft und eine lesbare Nachricht", () => {
    const error = new PriceError("NO_DEFAULT");
    expect(error.reason).toBe("NO_DEFAULT");
    expect(error.message).toContain("NO_DEFAULT");
    expect(error.name).toBe("PriceError");
  });
});
