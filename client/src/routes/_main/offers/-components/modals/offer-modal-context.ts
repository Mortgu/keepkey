import { createContext, useContext } from "react";
import type { Offer, PriceHeader } from "@keepit/schemas";
import type { OfferModalMode, OfferModalPolicy } from "./offer-modal-policy";
import type { OfferModalFormApi } from "@/routes/_main/offers/-hooks/use-offer-modal-form";

/**
 * Modus, Policy und Quellangebot werden bis in die einzelnen Positionen hinein
 * gebraucht. Über den Kontext statt über Props, damit die Sektionen und Items
 * unabhängig vom Angebotstyp dieselbe Signatur behalten.
 */
export interface OfferModalContextValue {
    mode: OfferModalMode;
    policy: OfferModalPolicy;
    form: OfferModalFormApi;
    /**
     * Beim Bearbeiten das bearbeitete Angebot, bei Verlängerung und Erweiterung
     * das Quellangebot. Undefined beim Anlegen.
     */
    sourceOffer: Offer | undefined;
    /**
     * Kunde, Vertrag und Laufzeit aus dem Formularkopf — der Teil der
     * Preiskoordinate, den alle Positionen teilen. Erst Produkt und Menge
     * machen sie vollständig.
     */
    header: PriceHeader;
}

const OfferModalContext = createContext<OfferModalContextValue | null>(null);

export const OfferModalProvider = OfferModalContext.Provider;

export function useOfferModalContext(): OfferModalContextValue {
    const value = useContext(OfferModalContext);

    if (value === null) {
        throw new Error("useOfferModalContext muss innerhalb von <OfferModal> verwendet werden.");
    }

    return value;
}
