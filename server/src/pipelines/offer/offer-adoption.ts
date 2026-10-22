import type { Prisma } from "@prisma/client";
import { parseGermanDate } from "../../lib/german-date.js";
import { formatDate } from "../../utils/utils.js";

/**
 * Welche Felder im Dokument sich ins Angebot zurückschreiben lassen — und wie
 * aus dem Text im Dokument wieder ein Wert wird.
 *
 * Bewusst eine ausdrückliche Liste: nur, was das Angebot selbst besitzt und
 * sich verlässlich aus dem Text lesen lässt. Nicht dazu gehören
 *  - Kunde, Ansprechpartner und Mitarbeiter: sie gehören den Stammdaten, ein
 *    Angebot darf sie nicht umschreiben,
 *  - Beträge und Positionen: sie hängen an Tarif, Menge und Summen und
 *    gehören in die Angebotsmaske (siehe `computeOfferModel`),
 *  - Belegnummer und Datum.
 *
 * `display` ist der Text, wie `presentOffer` den Wert darstellen würde — er
 * landet im gespeicherten Dokumentmodell, damit künftige Vergleiche stimmen.
 */
export type OfferAdoption = {
    parse(text: string): { data: Prisma.OfferUpdateInput; display: string } | null;
};

const text = (column: "paymentTerm"): OfferAdoption => ({
    // Die Angebotsmaske verlangt eine Zahlungsbedingung.
    parse: (value) => {
        const trimmed = value.trim();
        return trimmed === "" ? null : { data: { [column]: trimmed }, display: trimmed };
    },
});

const date = (column: "validUntil" | "requestFrom"): OfferAdoption => ({
    parse: (value) => {
        // Ein geleertes Feld heißt: kein Datum.
        if (value.trim() === "") return { data: { [column]: null }, display: "" };

        const iso = parseGermanDate(value);
        if (!iso) return null;
        // Gespeichert wird wie aus der Maske: Mitternacht UTC des gewählten Tages.
        const stored = new Date(`${iso}T00:00:00.000Z`);
        return { data: { [column]: stored }, display: formatDate(stored) ?? "" };
    },
});

export const offerAdoptions: Record<string, OfferAdoption> = {
    paymentTerm: text("paymentTerm"),
    validUntil: date("validUntil"),
    requestFrom: date("requestFrom"),
};
