import type { Language } from "@prisma/client";

/**
 * Das Angebot, wie es dokumentiert wird — **ohne** Darstellung.
 *
 * Beträge sind Cents, Daten ISO-Strings, nichts ist formatiert oder in eine
 * Sprache aufgelöst (Übersetzungen hängen an den Einträgen). Damit ist das
 * Modell JSON-sicher und lässt sich unverändert speichern: wer es später mit
 * einer anderen Vorlage oder Formatierung darstellt, muss nichts neu
 * berechnen. Aus ihm macht `presentOffer` die Daten für die Vorlage.
 *
 * Gerechnet wird in `computeOfferModel` — hier steht nur die Form.
 */
export type Translation = {
    language: Language;
    name: string;
    description: string | null;
    table: string | null;
};

export type ContractModel = {
    id: string;
    translations: Array<{ language: Language; name: string; features: string[] }>;
};

/** Die drei Beträge, die an einer Position hängen. `totalCents` ist brutto, siehe `netCents`. */
export type PositionAmounts = {
    unitCents: number;
    totalCents: number;
    discountCents: number;
};

export type PositionModel = PositionAmounts & {
    id: string;
    productId: string;
    quantity: number;
    freeMonths: number;
    optional: boolean;
    translations: Translation[];
};

/** Preise aller Positionen unter einem Vertrag. Die erste Tabelle gehört zum Vertrag des Angebots. */
export type PriceTableModel = {
    contractId: string;
    items: Array<PositionAmounts & { positionId: string }>;
    /** Netto über alle Positionen, plus Flatrates, minus Rabatte. */
    totalCents: number;
};

export type OfferModel = {
    quoteId: string;
    language: Language;
    date: string | null;
    validUntil: string | null;
    requestFrom: string | null;
    paymentTerm: string | null;
    supplierId: string | null;
    compare: boolean;
    duration_months: number;

    customer: {
        customerId: string | null;
        companyName: string;
        street: string | null;
        zip: string | null;
        city: string | null;
        phone: string | null;
    };
    contactPerson: {
        salutation: string | null;
        firstName: string;
        lastName: string;
        email: string | null;
    };
    employee: {
        salutation: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        email: string;
    };

    contract: ContractModel;
    /** Die übrigen Verträge, in Anzeigereihenfolge — leer, wenn nicht verglichen wird. */
    comparisonContracts: ContractModel[];

    positions: PositionModel[];
    flatRates: Array<{ totalCents: number; translations: Translation[] }>;
    discounts: Array<{ title: string; description: string | null; totalCents: number }>;

    /**
     * Preistabellen. Vergleichsverträge ohne vollständige Preise fehlen hier,
     * stehen aber weiter in `comparisonContracts`.
     */
    tables: PriceTableModel[];
};
