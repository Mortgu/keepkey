import { z } from "zod";

/**
 * Preis einer Angebotsposition — einheitlich für alle Preisquellen.
 *
 * Es gibt zwei Quellen, die dieselbe Form liefern:
 *
 * - **live**: der aktuell gültige Tarif (`GET /api/tariffs/price`).
 * - **pinned**: die Tarif-Version, die eine bestehende Position angepinnt hat
 *   (`GET /api/offers/:offerId/positions/:positionId/extension-price`).
 *
 * `total_cents` ist **brutto**, also `eur_user_month * quantity * duration_months`
 * ohne Abzug der Freimonate. Der Wert der Freimonate steht getrennt in
 * `discount_cents`; netto ist `total_cents - discount_cents`. Diese Aufteilung
 * ist dieselbe, in der eine Position gespeichert wird — Vorschau und
 * gespeichertes Angebot zeigen dadurch dieselben Zahlen.
 */
export const positionPriceSchema = z.object({
    /** Stückpreis pro Einheit und Monat. */
    eur_user_month: z.number().int(),
    /** Brutto-Gesamtpreis, vor Abzug der Freimonate. */
    total_cents: z.number().int(),
    /** Wert der Freimonate: `eur_user_month * quantity * free_months`. */
    discount_cents: z.number().int(),
    /**
     * true, wenn der Preis aus einer angepinnten Tarif-Version stammt.
     *
     * Live-Preise melden `false`. Bei einer Erweiterung bedeutet `false`
     * dagegen, dass die Quellposition keinen Pin hat und flach mit ihrem
     * gespeicherten Stückpreis gerechnet wurde — dann greifen Mengenstaffeln
     * nicht mehr.
     */
    fromSnapshot: z.boolean(),
});
export type PositionPrice = z.infer<typeof positionPriceSchema>;

/** Netto-Gesamtpreis einer Position: brutto abzüglich der Freimonate. */
export const netCents = (price: Pick<PositionPrice, "total_cents" | "discount_cents">): number =>
    price.total_cents - price.discount_cents;

/**
 * Koordinaten, die einen Preis im Tarif eindeutig adressieren.
 *
 * Die Feldnamen folgen bewusst der Angebotsposition, damit Koordinaten ohne
 * Umbenennung aus einer Position entstehen. Die Abbildung auf die abweichenden
 * Query-Parameter des Endpunkts (`duration`, `freeMonths`) passiert an genau
 * einer Stelle im API-Layer.
 */
export const priceCoordinatesSchema = z.object({
    customerId: z.string(),
    productId: z.string(),
    contractId: z.string(),
    duration_months: z.number().int(),
    quantity: z.number().int(),
    free_months: z.number().int(),
});
export type PriceCoordinates = z.infer<typeof priceCoordinatesSchema>;

/**
 * Koordinaten aus einer Angebotsposition.
 *
 * Die Felder werden einzeln übernommen statt gespreadet: eine gespeicherte
 * Position bringt `id`, `total_cents` und weitere Felder mit, die den
 * Query-Key aufblähen und Treffer im Cache verhindern würden.
 */
export const coordinatesFrom = (
    customerId: string,
    position: Omit<PriceCoordinates, "customerId">,
): PriceCoordinates => ({
    customerId,
    productId: position.productId,
    contractId: position.contractId,
    duration_months: position.duration_months,
    quantity: position.quantity,
    free_months: position.free_months,
});

/** true, wenn die Koordinaten vollständig sind und abgefragt werden dürfen. */
export const isPriceable = (coordinates: PriceCoordinates): boolean =>
    Boolean(coordinates.customerId)
    && Boolean(coordinates.productId)
    && Boolean(coordinates.contractId)
    && Number.isInteger(coordinates.quantity) && coordinates.quantity > 0
    && Number.isInteger(coordinates.duration_months) && coordinates.duration_months > 0
    && Number.isInteger(coordinates.free_months) && coordinates.free_months >= 0
    && coordinates.free_months <= coordinates.duration_months;
