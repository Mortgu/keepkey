import type { Language } from "@prisma/client";
import type { PositionPrice } from "@keepit/schemas";

import type { OfferTemplateItem } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation } from "@/utils/i18n.js";
import { formatCentsToEur, formatDate } from "@/utils/utils.js";

/**
 * Minimale Form einer Angebotsposition, die {@link toTemplateItem} braucht.
 * Strukturell statt über den Prisma-Typ, damit dieses Modul weder von der
 * Pipeline noch von den Includes in `fetchOfferData` abhängt.
 */
export interface PositionForTemplate {
    quantity: number;
    duration: number;
    free_months: number;
    optional: boolean | null;
    product: {
        translations: Array<{
            language: Language;
            name: string;
            description: string | null;
            table: string | null;
        }>;
    };
}

/** Umgebung, die nicht aus der Position selbst kommt. */
export interface TemplateItemContext {
    language: Language;
    /** Name des Vertrags, unter dem die Position dargestellt wird. */
    contractName: string;
    /** Gültigkeitsdatum des Angebots — steht an der Rabattzeile. */
    validUntil: Date | string | null;
    /**
     * Laufzeit als fertiger String.
     *
     * Bewusst vom Aufrufer vorgegeben: die flache `products`-Liste rendert
     * "12 Monate", die Tabellen die nackte Zahl, weil deren Kopfzeile selbst
     * " Monaten" anhängt. Solange beide Formen im Template stecken, wäre eine
     * gemeinsame Formatierung hier eine stille Änderung am Dokument.
     */
    durationLabel: string;
}

/**
 * Die einzige Stelle, an der aus einer Angebotsposition eine PDF-Zeile wird.
 *
 * Der Preis kommt **als Parameter** herein statt hier berechnet zu werden. Das
 * ist der springende Punkt: die Haupttabelle reicht die gespeicherten Werte der
 * Position durch, die Vergleichstabellen einen live berechneten Preis für einen
 * anderen Vertrag. Beide durchlaufen dieselbe Abbildung und können deshalb
 * nicht mehr auseinanderlaufen.
 *
 * Die Aufteilung folgt {@link PositionPrice}: `total` ist **brutto** über die
 * volle Laufzeit, der Wert der Freimonate steht getrennt in `discount.total`
 * (negativ, weil er im Dokument als eigene Zeile darunter erscheint). Netto ist
 * die Differenz — siehe `netCents` in `@keepit/schemas`.
 */
export function toTemplateItem(
    position: PositionForTemplate,
    price: PositionPrice,
    context: TemplateItemContext,
): OfferTemplateItem {
    const translation = pickTranslation(position.product.translations, context.language);

    return {
        name: translation?.name ?? "",
        description: translation?.description ?? "",
        content: translation?.table ?? "",
        quantity: String(position.quantity),
        eur_user_month: formatCentsToEur(price.eur_user_month),
        duration: context.durationLabel,
        total: formatCentsToEur(price.total_cents),
        contract: context.contractName,
        optional: position.optional ?? false,
        discount: {
            free_months: position.free_months,
            valid_until: formatDate(context.validUntil),
            total: formatCentsToEur(-price.discount_cents),
        },
    };
}

/**
 * Preis einer Position so, wie er beim Anlegen des Angebots festgeschrieben
 * wurde.
 *
 * Das Angebot ist die Quelle der Wahrheit, nicht der heutige Tarif: ein einmal
 * verschicktes Dokument muss bei jeder erneuten Erzeugung dieselben Zahlen
 * zeigen, auch wenn die Preistabelle inzwischen eine andere ist.
 */
export const storedPrice = (position: {
    eur_user_month: number;
    total_cents: number;
    discount_cents: number;
}): PositionPrice => ({
    eur_user_month: position.eur_user_month,
    total_cents: position.total_cents,
    discount_cents: position.discount_cents,
    fromSnapshot: true,
});

/**
 * Preis aus einer frischen Tarif-Berechnung — für die Vergleichstabellen.
 *
 * Nur dort richtig: diese Positionen hat es unter dem anderen Vertrag nie
 * gegeben, es gibt also keinen gespeicherten Wert, der gelten könnte.
 *
 * Die Aufteilung ist dieselbe wie beim Speichern einer Position
 * (`pricePositions` in offer.service): `total_cents` brutto über die volle
 * Laufzeit, die Freimonate getrennt in `discount_cents`.
 */
export const livePrice = (
    unitPrice: number,
    position: { quantity: number; duration: number; free_months: number },
): PositionPrice => ({
    eur_user_month: unitPrice,
    total_cents: unitPrice * position.quantity * position.duration,
    discount_cents: unitPrice * position.quantity * position.free_months,
    fromSnapshot: false,
});
