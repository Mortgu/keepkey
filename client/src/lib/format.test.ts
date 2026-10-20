import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatEur, formatNumber } from "./format";

/** Intl setzt geschützte Leerzeichen (U+00A0, U+202F); für den Vergleich zählen sie als normale. */
const plain = (s: string) => s.replace(/[\u00A0\u202F]/g, " ");

describe("formatDate", () => {
    it("schreibt das Datum auf Deutsch wie bisher", () => {
        expect(plain(formatDate("2026-10-20T12:00:00Z", "DE"))).toBe("20. Oktober 2026");
    });

    it("schreibt das Datum mit Sprache EN britisch", () => {
        expect(plain(formatDate("2026-10-20T12:00:00Z", "EN"))).toBe("20 October 2026");
    });
});

describe("formatCurrency", () => {
    it("schreibt Euro auf Deutsch", () => {
        expect(plain(formatCurrency(1234.56, "DE"))).toBe("1.234,56 €");
    });

    it("schreibt Euro mit Sprache EN britisch", () => {
        expect(plain(formatCurrency(1234.56, "EN"))).toBe("€1,234.56");
    });
});

describe("formatEur", () => {
    it("rechnet Cent in Euro um und schreibt sie auf Deutsch", () => {
        expect(plain(formatEur(123456, "DE"))).toBe("1.234,56 €");
    });

    it("rechnet Cent in Euro um und schreibt sie mit Sprache EN britisch", () => {
        expect(plain(formatEur(-5, "EN"))).toBe("-€0.05");
    });
});

describe("formatNumber", () => {
    it("setzt das Dezimalkomma auf Deutsch", () => {
        expect(formatNumber(19.5, "DE")).toBe("19,5");
    });

    it("setzt den Dezimalpunkt mit Sprache EN", () => {
        expect(formatNumber(19.5, "EN")).toBe("19.5");
    });
});
