import { useState } from "react";
import { findOfferFilesByIdAction } from "@/data/nextcloud";

export function useQuoteIdCheck() {
    const [quoteIdWarning, setQuoteIdWarning] = useState<string | undefined>(undefined);
    const [checkingQuoteId, setCheckingQuoteId] = useState(false);

    const clearQuoteIdWarning = () => setQuoteIdWarning(undefined);

    const checkQuoteId = async (id: string) => {
        if (!id) {
            setQuoteIdWarning(undefined);
            return;
        }
        setCheckingQuoteId(true);
        try {
            const result = await findOfferFilesByIdAction(id);
            setQuoteIdWarning(result.found ? "Datei existiert bereits" : undefined);
        } catch {
            setQuoteIdWarning(undefined);
        } finally {
            setCheckingQuoteId(false);
        }
    };

    return { quoteIdWarning, checkingQuoteId, checkQuoteId, clearQuoteIdWarning };
}