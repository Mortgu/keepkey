import { describe, expect, it } from "vitest";
import type { Language } from "@prisma/client";
import { translateFields } from "./i18n.js";

type Translation = { language: Language; name?: string; table?: string; features?: string[] };

describe("translateFields", () => {
    it("resolves each field from the translation matching the requested language", () => {
        const translations: Translation[] = [
            { language: "DE", name: "Produkt", table: "Produkttabelle" },
            { language: "EN", name: "Product", table: "Product table" },
        ];
        const result = translateFields(translations, "EN", { name: "", table: "" });
        expect(result).toEqual({ name: "Product", table: "Product table" });
    });

    it("falls back to the DE translation when the requested language is missing, per pickTranslation", () => {
        const translations: Translation[] = [{ language: "DE", name: "Produkt", table: "Produkttabelle" }];
        const result = translateFields(translations, "EN", { name: "", table: "" });
        expect(result).toEqual({ name: "Produkt", table: "Produkttabelle" });
    });

    it("falls back to the given fallback object when there are no translations at all", () => {
        const result = translateFields([], "EN", { name: "fallback-name", table: "fallback-table" });
        expect(result).toEqual({ name: "fallback-name", table: "fallback-table" });
    });

    it("falls back per-field when the picked translation doesn't carry that field", () => {
        const translations: Translation[] = [{ language: "EN", name: "Product" }];
        const result = translateFields(translations, "EN", { name: "", table: "fallback-table" });
        expect(result).toEqual({ name: "Product", table: "fallback-table" });
    });

    it("resolves non-string fields (e.g. features arrays), falling back to the given default", () => {
        const withFeatures: Translation[] = [{ language: "EN", name: "Product", features: ["a", "b"] }];
        expect(translateFields(withFeatures, "EN", { name: "", features: [] as string[] })).toEqual({ name: "Product", features: ["a", "b"] });
        expect(translateFields([], "EN", { name: "", features: ["default"] })).toEqual({ name: "", features: ["default"] });
    });
});
