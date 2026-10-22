import { LOCALES } from "./format";
import type { Currency, Language } from "@keepit/schemas";
import type { SelectOption } from "@/components";

export interface CountryConfig {
    /** ISO-3166-Code; daraus entsteht der Anzeigename in der aktiven Sprache. */
    code: string;
    /**
     * Der am Kunden gespeicherte Wert (historisch der deutsche Name). Er ist ein
     * Datenwert und kein Anzeigetext — angezeigt wird {@link countryOptions}.
     */
    name: string;
    language: Language;
    currency: Currency;
    taxRate: number;
}

export const COUNTRIES: Array<CountryConfig> = [
    { code: "DE", name: "Deutschland", language: "DE", currency: "EUR", taxRate: 19 },
    { code: "CH", name: "Schweiz", language: "DE", currency: "CHF", taxRate: 7.7 },
    { code: "ZA", name: "Südafrika", language: "EN", currency: "RAND", taxRate: 15 },
];

export const findCountryByName = (name?: string | null): CountryConfig =>
    COUNTRIES.find((c) => c.name === name) ?? COUNTRIES[0];

/** Die Inhaltssprachen — dieselben, für die es ein Zahlen-/Datumsformat gibt. */
const LANGUAGES = Object.keys(LOCALES) as Array<Language>;

/*
 * Länder- und Sprachnamen kommen aus `Intl.DisplayNames` statt aus den
 * Sprachdateien: die Namen sind dort für jede Sprache gepflegt. Die Sprache ist
 * Parameter, damit Komponenten sie über `useLocale()` als Eingabe haben und ein
 * Sprachwechsel neu beschriftet.
 */

/** Länder als Auswahl: Wert ist der gespeicherte Name, Beschriftung in `language`. */
export function countryOptions(language: Language): Array<SelectOption> {
    const names = new Intl.DisplayNames(LOCALES[language], { type: "region" });
    return COUNTRIES.map((c) => ({ value: c.name, label: names.of(c.code) ?? c.name }));
}

/** Inhaltssprachen (DE/EN) als Auswahl, beschriftet in `language`. */
export function languageOptions(language: Language): Array<SelectOption<Language>> {
    const names = new Intl.DisplayNames(LOCALES[language], { type: "language" });
    return LANGUAGES.map((code) => ({ value: code, label: names.of(code.toLowerCase()) ?? code }));
}

export const CURRENCY_OPTIONS = [
    { value: "EUR", label: "EUR (€)" },
    { value: "CHF", label: "CHF" },
    { value: "RAND", label: "RAND (R)" },
    { value: "DOLLAR", label: "USD ($)" },
];
