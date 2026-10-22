import { describe, expect, it } from "vitest";
import { countryOptions, languageOptions } from "./countries";

describe("countryOptions", () => {
    it("beschriftet die Länder auf Deutsch wie bisher", () => {
        expect(countryOptions("DE").map((o) => o.label)).toEqual(["Deutschland", "Schweiz", "Südafrika"]);
    });

    it("beschriftet die Länder mit Sprache EN englisch", () => {
        expect(countryOptions("EN").map((o) => o.label)).toEqual(["Germany", "Switzerland", "South Africa"]);
    });

    it("behält den gespeicherten Wert unabhängig von der Sprache", () => {
        expect(countryOptions("EN").map((o) => o.value)).toEqual(["Deutschland", "Schweiz", "Südafrika"]);
    });
});

describe("languageOptions", () => {
    it("beschriftet die Sprachen auf Deutsch wie bisher", () => {
        expect(languageOptions("DE")).toEqual([
            { value: "DE", label: "Deutsch" },
            { value: "EN", label: "Englisch" },
        ]);
    });

    it("beschriftet die Sprachen mit Sprache EN englisch", () => {
        expect(languageOptions("EN")).toEqual([
            { value: "DE", label: "German" },
            { value: "EN", label: "English" },
        ]);
    });
});
