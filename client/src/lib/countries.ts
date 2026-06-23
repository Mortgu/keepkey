import type { Language } from "@/types";
import type { components } from "@/types/api";

type Currency = components["schemas"]["Currency"];

export interface CountryConfig {
  code: string;
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

export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name }));

export const LANGUAGE_OPTIONS = [
  { value: "DE", label: "Deutsch" },
  { value: "EN", label: "Englisch" },
];

export const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (€)" },
  { value: "CHF", label: "CHF" },
  { value: "RAND", label: "RAND (R)" },
  { value: "DOLLAR", label: "USD ($)" },
];
