import { describe, it, expect } from "vitest";
import { interpolate, deepIterate } from "./utils.js";

describe("interpolate", () => {
  it("ersetzt einfache Platzhalter", () => {
    expect(interpolate("Hallo {name}", { name: "ACME" })).toBe("Hallo ACME");
  });

  it("ersetzt verschachtelte Keys mit Punktnotation", () => {
    expect(
      interpolate("Kunde: {customer.companyName}", {
        customer: { companyName: "Keepit GmbH" },
      }),
    ).toBe("Kunde: Keepit GmbH");
  });

  it("ersetzt mehrere Platzhalter in einem String", () => {
    expect(
      interpolate("{a} und {b}", { a: "eins", b: "zwei" }),
    ).toBe("eins und zwei");
  });

  it("lässt unbekannte Platzhalter unverändert stehen", () => {
    expect(interpolate("{fehlt}", {})).toBe("{fehlt}");
    expect(interpolate("{customer.unknown}", { customer: {} })).toBe(
      "{customer.unknown}",
    );
  });

  it("konvertiert Nicht-String-Werte zu Strings", () => {
    expect(interpolate("Anzahl: {count}", { count: 5 })).toBe("Anzahl: 5");
  });

  it("behandelt null/undefined als nicht ersetzbar", () => {
    expect(interpolate("{x}", { x: null })).toBe("{x}");
    expect(interpolate("{x}", { x: undefined })).toBe("{x}");
  });
});

describe("deepIterate", () => {
  it("interpoliert Strings auf oberster Ebene", () => {
    const result = deepIterate({ greeting: "Hi {name}" }, { name: "Keepit" });
    expect(result.greeting).toBe("Hi Keepit");
  });

  it("interpoliert Strings in verschachtelten Objekten", () => {
    const data = { outer: { inner: "{name}-Tarif" } };
    const result = deepIterate(data, { name: "Pro" });
    expect((result.outer as Record<string, unknown>).inner).toBe("Pro-Tarif");
  });

  it("interpoliert String-Elemente in Arrays", () => {
    const data = { items: ["{name}", "statisch"] };
    const result = deepIterate(data, { name: "X" });
    expect(result.items).toEqual(["X", "statisch"]);
  });

  it("interpoliert Strings in Objekt-Arrays aus dem Root-Scope", () => {
    const data = {
      products: [{ label: "{name}" }, { label: "{name}" }],
    };
    const result = deepIterate(data, { name: "Backup" });
    expect(result.products).toEqual([{ label: "Backup" }, { label: "Backup" }]);
  });

  it("erlaubt innerhalb eines Array-Items Verweise auf Geschwisterfelder (lokaler Scope)", () => {
    // Eigene Felder des Items überschreiben gleichnamige Root-Keys (gewolltes Verhalten).
    const data = {
      products: [{ name: "Backup", caption: "Tarif: {name}" }],
    };
    const result = deepIterate(data, { name: "ROOT" });
    expect(result.products).toEqual([
      { name: "Backup", caption: "Tarif: Backup" },
    ]);
  });

  it("mutiert und gibt dasselbe Objekt zurück", () => {
    const data = { v: "{name}" };
    const result = deepIterate(data, { name: "Y" });
    expect(result).toBe(data);
  });
});
