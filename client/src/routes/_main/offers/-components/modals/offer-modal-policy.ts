import type { PriceSource } from "@/hooks";

/**
 * Angebot, Verlängerung und Lizenzerweiterung teilen sich dieselbe Maske und
 * denselben Formularzustand — sie unterscheiden sich nur darin, was man bedienen
 * darf, woher die Preise kommen und welche Mutation am Ende läuft.
 *
 * Genau das steht hier: eine Tabelle statt `mode === "extension"`-Abfragen quer
 * durch den Komponentenbaum. Ein vierter Angebotstyp ist ein weiterer Eintrag.
 */
export type OfferModalMode = "offer" | "renewal" | "extension";

/**
 * `readonly` rendert dasselbe Bedienelement gesperrt — der Wert bleibt sichtbar
 * und wird weiterhin mitgeschickt. `hidden` blendet es aus, ohne den Wert aus
 * dem Formular zu nehmen.
 */
export type FieldAccess = "edit" | "readonly" | "hidden";

export type HeaderField =
    | "customerId"
    | "contactPersonId"
    | "userId"
    | "quoteId"
    | "supplierId"
    | "paymentTerm"
    | "validUntil"
    | "requestFrom"
    | "language";

export type PositionField =
    | "productId"
    | "contractId"
    | "duration_months"
    | "quantity"
    | "free_months"
    | "optional"
    | "unitPrice";

export interface SectionPolicy {
    /** `hidden` blendet die gesamte Sektion aus. */
    access: FieldAccess;
    canAdd: boolean;
    canRemove: boolean;
    /** Startet leer, statt die Einträge des Quellangebots zu übernehmen. */
    startEmpty: boolean;
}

export interface OfferModalPolicy {
    header: Record<HeaderField, FieldAccess>;
    positions: SectionPolicy & { fields: Record<PositionField, FieldAccess> };
    flatrates: SectionPolicy;
    discounts: SectionPolicy;
    featureComparison: FieldAccess;
    /**
     * Woher die angezeigten Preise kommen. Die Erweiterung liest die angepinnte
     * Tarif-Version, weil der Server sie ebenso abrechnet — läse die UI live,
     * stimmte der angezeigte Betrag nicht mit dem gespeicherten überein.
     */
    priceSource: PriceSource;
    /** Abgeleitete Angebote bekommen eine neue AG-Nummer, keine übernommene. */
    resetQuoteId: boolean;
}

const ALL_HEADER_FIELDS_EDITABLE: Record<HeaderField, FieldAccess> = {
    customerId: "edit",
    contactPersonId: "edit",
    userId: "edit",
    quoteId: "edit",
    supplierId: "edit",
    paymentTerm: "edit",
    validUntil: "edit",
    requestFrom: "edit",
    language: "edit",
};

/**
 * In abgeleiteten Angeboten stammt der Kopf aus dem Quellangebot. Er bleibt
 * sichtbar, damit man sieht, worauf man sich bezieht — editierbar sind nur die
 * drei Felder, die das neue Angebot ausmachen.
 */
const DERIVED_HEADER_FIELDS: Record<HeaderField, FieldAccess> = {
    ...ALL_HEADER_FIELDS_EDITABLE,
    customerId: "readonly",
    contactPersonId: "readonly",
    userId: "readonly",
    supplierId: "readonly",
    paymentTerm: "readonly",
    language: "readonly",
};

export const OFFER_MODAL_POLICIES: Record<OfferModalMode, OfferModalPolicy> = {
    offer: {
        header: ALL_HEADER_FIELDS_EDITABLE,
        positions: {
            access: "edit",
            canAdd: true,
            canRemove: true,
            startEmpty: false,
            fields: {
                productId: "edit",
                contractId: "edit",
                duration_months: "edit",
                quantity: "edit",
                free_months: "edit",
                optional: "edit",
                unitPrice: "edit",
            },
        },
        flatrates: { access: "edit", canAdd: true, canRemove: true, startEmpty: false },
        discounts: { access: "edit", canAdd: true, canRemove: true, startEmpty: false },
        featureComparison: "edit",
        priceSource: "live",
        resetQuoteId: false,
    },

    /**
     * Verlängerung: dieselben Produkte weiterführen, zu den heutigen
     * Konditionen. Neue Positionen gehören in ein neues Angebot.
     */
    renewal: {
        header: DERIVED_HEADER_FIELDS,
        positions: {
            access: "edit",
            canAdd: true,
            canRemove: true,
            startEmpty: false,
            fields: {
                productId: "readonly",
                contractId: "readonly",
                duration_months: "edit",
                quantity: "edit",
                free_months: "edit",
                optional: "hidden",
                unitPrice: "hidden",
            },
        },
        flatrates: { access: "edit", canAdd: false, canRemove: true, startEmpty: false },
        discounts: { access: "edit", canAdd: true, canRemove: true, startEmpty: false },
        featureComparison: "hidden",
        priceSource: "live",
        resetQuoteId: true,
    },

    /**
     * Lizenzerweiterung: zusätzliche Seats innerhalb eines laufenden Vertrags.
     * Produkt, Vertrag und Laufzeit stehen fest — sie bestimmen die Spalte in
     * der angepinnten Preistabelle. Flatrates entfallen, weil sie vertragsweite
     * Pauschalen sind und in einer Nachbestellung doppelt fakturiert würden.
     */
    extension: {
        header: DERIVED_HEADER_FIELDS,
        positions: {
            access: "edit",
            canAdd: true,
            canRemove: true,
            startEmpty: false,
            fields: {
                productId: "edit",
                contractId: "edit",
                duration_months: "edit",
                quantity: "edit",
                free_months: "edit",
                optional: "hidden",
                unitPrice: "edit",
            },
        },
        flatrates: { access: "hidden", canAdd: false, canRemove: false, startEmpty: true },
        // Rabatte des Quellangebots gelten nicht automatisch für eine
        // Nachbestellung — sie starten leer und sind manuell ergänzbar.
        discounts: { access: "edit", canAdd: true, canRemove: true, startEmpty: true },
        featureComparison: "hidden",
        priceSource: "pinned",
        resetQuoteId: true,
    },
};

/** Verbindet das `<form>` im Kopfbereich mit dem Speichern-Button im Footer. */
export const OFFER_MODAL_FORM_ID = "offer-modal-form";
