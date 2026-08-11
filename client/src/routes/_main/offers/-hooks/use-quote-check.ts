import { useState } from "react";
import { getQuoteIdAvailability } from "@/hooks/offers/offer-api";
import type { QuoteIdConflict } from "@keepit/schemas";

export type QuoteIdCheckResult = {
    conflict: QuoteIdConflict | null;
    /** false = NextCloud war nicht erreichbar, Bestandsdateien blieben ungeprüft. */
    cloudChecked: boolean;
};

/**
 * Prüft eine eingegebene Belegnummer gegen Datenbank und NextCloud.
 *
 * Reines Vorab-Feedback: verbindlich entscheidet erst der Unique-Constraint beim Speichern.
 * Ein Fehler beim Prüfen darf deshalb nie das Formular blockieren.
 */
export function useQuoteIdCheck() {
    const [result, setResult] = useState<QuoteIdCheckResult | undefined>(undefined);
    const [checkingQuoteId, setCheckingQuoteId] = useState(false);

    const clearQuoteIdWarning = () => setResult(undefined);

    const checkQuoteId = async (id: string) => {
        if (!id) {
            setResult(undefined);
            return;
        }

        setCheckingQuoteId(true);
        try {
            const availability = await getQuoteIdAvailability(id);
            setResult({
                conflict: availability.available ? null : availability.conflict,
                cloudChecked: availability.cloudChecked,
            });
        } catch {
            setResult(undefined);
        } finally {
            setCheckingQuoteId(false);
        }
    };

    return {
        quoteIdConflict: result?.conflict ?? null,
        quoteIdCloudChecked: result?.cloudChecked ?? true,
        checkingQuoteId,
        checkQuoteId,
        clearQuoteIdWarning,
    };
}
