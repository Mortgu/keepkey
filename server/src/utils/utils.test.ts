import { describe, it, expect } from "vitest";
import { formatDate, formatDuration, formatEur, toDate } from "./utils.js";

describe("formatDuration", () => {
  it.each([
    [12, "1 Jahr"],
    [24, "2 Jahre"],
    [36, "3 Jahre"],
  ])("mappt %i Monate auf %s", (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });

  it("liefert Platzhalter für unbekannte Dauer", () => {
    expect(formatDuration(99)).toBe("x Jahre");
    expect(formatDuration(0)).toBe("x Jahre");
  });
});

describe("formatEur", () => {
  it("formatiert mit zwei Nachkommastellen und Euro-Zeichen", () => {
    expect(formatEur(1234.5)).toBe("1.234,50 €");
  });

  it("rundet auf zwei Nachkommastellen", () => {
    expect(formatEur(0.005)).toBe("0,01 €");
  });

  it("behandelt Null korrekt", () => {
    expect(formatEur(0)).toBe("0,00 €");
  });
});

describe("formatDate", () => {
  // Lokale Date-Konstruktion vermeidet Zeitzonen-Verschiebungen beim Parsen.
  it("formatiert ein Date-Objekt deutsch mit zweistelligem Tag", () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe("05. Januar 2024");
  });

  it("formatiert zweistellige Tage unverändert", () => {
    expect(formatDate(new Date(2024, 11, 31))).toBe("31. Dezember 2024");
  });
});

describe("toDate", () => {
  it("gibt null für leere Eingaben zurück", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate("")).toBeNull();
  });

  it("gibt null für ungültige Datumsstrings zurück", () => {
    expect(toDate("kein-datum")).toBeNull();
  });

  it("parst einen gültigen ISO-String", () => {
    const result = toDate("2024-06-18T00:00:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2024-06-18T00:00:00.000Z");
  });
});
