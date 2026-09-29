/**
 * Preise werden durchgehend in Cent gespeichert und übertragen, in der
 * Oberfläche aber in Euro eingegeben. Beide Richtungen liegen hier neben
 * {@link formatEur}, damit keine Eingabemaske ihre eigene Umrechnung erfindet —
 * eine vergessene Umrechnung ist ein Faktor-100-Fehler am Preis.
 */
export const formatEur = (cent: number): string => {
    cent = cent / 100;
    return (
        cent.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + " €"
    );
};

export const eurToCents = (eur: number): number => Math.round(eur * 100);

export const centsToEur = (cent: number): number => cent / 100;
