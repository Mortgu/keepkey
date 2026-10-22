import { describe, expect, it } from "vitest";
import { formatDate } from "../utils/utils.js";
import { parseGermanDate } from "./german-date.js";

describe("parseGermanDate", () => {
    it("liest das Format von formatDate zurück, für jeden Monat", () => {
        for (let month = 0; month < 12; month++) {
            const date = new Date(Date.UTC(2026, month, 5));
            expect(parseGermanDate(formatDate(date)!)).toBe(date.toISOString().slice(0, 10));
        }
    });

    it("liest Ziffern- und ISO-Schreibweise", () => {
        expect(parseGermanDate("1.11.2026")).toBe("2026-11-01");
        expect(parseGermanDate("01. 11. 2026")).toBe("2026-11-01");
        expect(parseGermanDate("2026-11-01")).toBe("2026-11-01");
    });

    it("liest Abkürzungen und Groß-/Kleinschreibung", () => {
        expect(parseGermanDate("1. Nov. 2026")).toBe("2026-11-01");
        expect(parseGermanDate("3. MÄR 2026")).toBe("2026-03-03");
        expect(parseGermanDate("  1.   dezember   2026 ")).toBe("2026-12-01");
    });

    it("lehnt unmögliche und unlesbare Angaben ab", () => {
        expect(parseGermanDate("31. Februar 2026")).toBeNull();
        expect(parseGermanDate("29.02.2026")).toBeNull();
        expect(parseGermanDate("1. Foo 2026")).toBeNull();
        expect(parseGermanDate("morgen")).toBeNull();
        expect(parseGermanDate("")).toBeNull();
    });

    it("akzeptiert den 29. Februar im Schaltjahr", () => {
        expect(parseGermanDate("29. Februar 2028")).toBe("2028-02-29");
    });
});
