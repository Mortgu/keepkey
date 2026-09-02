import type { Language } from "@keepit/schemas";

const LOCALES: Record<Language, string> = { DE: "de-DE", EN: "en-GB" };

/**
 * `2026-08` → „Aug. 26".
 *
 * Der Monatsschlüssel ist bewusst ein String und kein Datum; zum Beschriften
 * wird er hier einmal zu einem Datum gemacht — mittags UTC, damit keine
 * Zeitzone ihn auf den Vormonat schiebt.
 */
export function monthLabel(month: string, language: Language): string {
    const [year, index] = month.split("-").map(Number);
    const date = new Date(Date.UTC(year, index - 1, 15, 12));

    return new Intl.DateTimeFormat(LOCALES[language], {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
    }).format(date);
}
