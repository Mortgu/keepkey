import { describe, it, expect } from "vitest";
import { selectPrice, type TariffForPricing } from "./products.js";

/**
 * Tariff mit zwei Laufzeit-Spalten (12 / 24 Monate) und zwei Mengen-Zeilen
 * (1–10, 11–unbegrenzt). Default-Preis pro Zelle, plus ein Kunden-Override.
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
        rowId: "rowSmall",
        columnId: "col12",
        default_cells: [{ price: 10 }],
        customer_cells: [{ customerId: "vip", price: 8 }],
      },
      {
        rowId: "rowSmall",
        columnId: "col24",
        default_cells: [{ price: 9 }],
        customer_cells: [],
      },
      {
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
    // rowSmall/col12 → 10 € * 5 Stück * 12 Monate
    expect(selectPrice(buildTariff(), { duration: 12, quantity: 5 })).toBe(600);
  });

  it("wählt die richtige Zeile anhand der Mengen-Range", () => {
    // quantity 15 → rowLarge/col12 → 5 * 15 * 12
    expect(selectPrice(buildTariff(), { duration: 12, quantity: 15 })).toBe(900);
  });

  it("behandelt offene Obergrenze (max_quantity = null)", () => {
    expect(selectPrice(buildTariff(), { duration: 12, quantity: 9999 })).toBe(
      5 * 9999 * 12,
    );
  });

  it("wendet einen Kunden-Override an, wenn vorhanden", () => {
    // vip → 8 statt 10
    expect(
      selectPrice(buildTariff(), { duration: 12, quantity: 5, customerId: "vip" }),
    ).toBe(8 * 5 * 12);
  });

  it("nutzt den Default-Preis bei unbekanntem Kunden", () => {
    expect(
      selectPrice(buildTariff(), { duration: 12, quantity: 5, customerId: "unknown" }),
    ).toBe(10 * 5 * 12);
  });

  it("gibt 0 zurück, wenn keine Spalte zur Dauer passt", () => {
    expect(selectPrice(buildTariff(), { duration: 36, quantity: 5 })).toBe(0);
  });

  it("gibt 0 zurück, wenn keine Zeile zur Menge passt", () => {
    expect(selectPrice(buildTariff(), { duration: 12, quantity: 0 })).toBe(0);
  });

  it("gibt 0 zurück, wenn keine passende Zelle existiert", () => {
    // rowLarge/col24 ist nicht definiert
    expect(selectPrice(buildTariff(), { duration: 24, quantity: 15 })).toBe(0);
  });

  it("gibt 0 zurück, wenn kein Default-Preis hinterlegt ist", () => {
    const tariff = buildTariff();
    tariff.cells[0].default_cells = [];
    expect(selectPrice(tariff, { duration: 12, quantity: 5 })).toBe(0);
  });

  it("gibt 0 zurück bei fehlendem Tarif", () => {
    expect(selectPrice(null, { duration: 12, quantity: 5 })).toBe(0);
    expect(selectPrice(undefined, { duration: 12, quantity: 5 })).toBe(0);
  });
});
