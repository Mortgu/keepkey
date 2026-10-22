import type { Language } from "@keepit/schemas";

/**
 * Die einzige Zuordnung Sprache → BCP-47-Locale im Client. Datum, Beträge und
 * Chart-Beschriftungen leiten ihr Format hieraus ab; die Währung bleibt EUR.
 */
export const LOCALES: Record<Language, string> = { DE: "de-DE", EN: "en-GB" };

export const formatDate = (date: Date | string, language: Language) => {
    return new Date(date).toLocaleDateString(LOCALES[language], {
        day: "2-digit", month: "long", year: "numeric"
    })
}

export const sumItems = (items: Array<{ price36Raw: number }>) => {
    return items.reduce((acc, i) => acc + i.price36Raw, 0);
}

export const formatCurrency = (value: number, language: Language) => new Intl.NumberFormat(LOCALES[language], {
    style: "currency", currency: "EUR"
}).format(value);

/** Preise liegen durchgehend in Cent vor; angezeigt werden sie als Euro-Betrag. */
export const formatEur = (cent: number, language: Language) => formatCurrency(cent / 100, language);

export const formatNumber = (value: number, language: Language) => value.toLocaleString(LOCALES[language]);
