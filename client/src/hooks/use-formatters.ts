import { useMemo } from "react";
import { useLocale } from "./use-locale";
import { formatDate, formatEur, formatNumber } from "@/lib/format";

export interface Formatters {
    formatDate: (date: Date | string) => string;
    formatEur: (cent: number) => string;
    formatNumber: (value: number) => string;
}

/**
 * Datums-, Zahlen- und Euro-Formatierer in der aktiven Sprache.
 *
 * Komponenten formatieren über diesen Hook statt über die Funktionen aus
 * `@/lib/format` direkt: nur so ist die Sprache eine Eingabe der Komponente.
 * Ein Sprachwechsel rendert sie dann neu, und der React Compiler verwirft die
 * gemerkten Werte — ein Aufruf, der die Sprache selbst nachschlüge, bliebe im
 * alten Format stehen.
 *
 * Das Ergebnis ist je Sprache stabil und taugt damit als Abhängigkeit.
 */
export function useFormatters(): Formatters {
    const language = useLocale();

    return useMemo(() => ({
        formatDate: (date: Date | string) => formatDate(date, language),
        formatEur: (cent: number) => formatEur(cent, language),
        formatNumber: (value: number) => formatNumber(value, language),
    }), [language]);
}
