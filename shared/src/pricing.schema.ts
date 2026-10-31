import { z } from "zod";

export const priceOriginSchema = z.enum(["list", "customer"]);
export type PriceOrigin = z.infer<typeof priceOriginSchema>;

export const positionPriceSchema = z.object({
    unitCents: z.number().int(),
    totalCents: z.number().int(),
    discountCents: z.number().int(),

    fromSnapshot: z.boolean(),

    origin: priceOriginSchema,

    list_eur_user_month: z.number().int().nullable(),
});
export type PositionPrice = z.infer<typeof positionPriceSchema>;

/** Netto-Gesamtpreis einer Position: brutto abzüglich der Freimonate. */
export const netCents = (price: Pick<PositionPrice, "totalCents" | "discountCents">): number =>
    price.totalCents - price.discountCents;

export type VatTotals = {
    netCents: number;
    vatRate: number;
    vatCents: number;
    grossCents: number;
};

/**
 * Mehrwertsteuer auf einen Nettobetrag — für Auftragsbestätigung und Rechnung.
 *
 * `taxRate` in Prozent (19 = 19 %), wie an `Customer.taxRate` hinterlegt und im
 * Accepted-Snapshot eingefroren. Gerundet wird einmal, kaufmännisch, auf den
 * Cent — damit Netto + MwSt exakt Brutto ergibt und sich beim Summieren mehrerer
 * Positionen keine Rundungsdifferenzen einschleichen.
 */
export const vatTotals = (netCents: number, taxRate: number): VatTotals => {
    const vatCents = Math.round(netCents * taxRate / 100);
    return { netCents, vatRate: taxRate, vatCents, grossCents: netCents + vatCents };
};

/**
 * Koordinaten, die einen Preis im Tarif eindeutig adressieren.
 *
 * Die Feldnamen folgen bewusst dem Angebot, damit Koordinaten ohne Umbenennung
 * aus Kopf und Position entstehen. Die Abbildung auf die abweichenden
 * Query-Parameter des Endpunkts (`duration`, `freeMonths`) passiert an genau
 * einer Stelle im API-Layer.
 */
export const priceCoordinatesSchema = z.object({
    customerId: z.string(),
    productId: z.string(),
    contractId: z.string(),
    duration_months: z.number().int(),
    quantity: z.number().int(),
    freeMonths: z.number().int(),
});
export type PriceCoordinates = z.infer<typeof priceCoordinatesSchema>;

/**
 * Der Teil der Koordinaten, der am Angebotskopf hängt. Vertrag und Laufzeit
 * gelten für alle Positionen gemeinsam; erst Produkt und Menge machen die
 * Koordinate vollständig.
 */
export type PriceHeader = Pick<PriceCoordinates, "customerId" | "contractId" | "duration_months">;

/**
 * Koordinaten aus Angebotskopf und Position.
 *
 * Die Felder werden einzeln übernommen statt gespreadet: eine gespeicherte
 * Position bringt `id`, `totalCents` und weitere Felder mit, die den
 * Query-Key aufblähen und Treffer im Cache verhindern würden.
 */
export const coordinatesFrom = (
    header: PriceHeader,
    position: Pick<PriceCoordinates, "productId" | "quantity" | "freeMonths">,
): PriceCoordinates => ({
    customerId: header.customerId,
    contractId: header.contractId,
    duration_months: header.duration_months,
    productId: position.productId,
    quantity: position.quantity,
    freeMonths: position.freeMonths,
});

/** true, wenn die Koordinaten vollständig sind und abgefragt werden dürfen. */
export const isPriceable = (coordinates: PriceCoordinates): boolean =>
    Boolean(coordinates.customerId)
    && Boolean(coordinates.productId)
    && Boolean(coordinates.contractId)
    && Number.isInteger(coordinates.quantity) && coordinates.quantity > 0
    && Number.isInteger(coordinates.duration_months) && coordinates.duration_months > 0
    && Number.isInteger(coordinates.freeMonths) && coordinates.freeMonths >= 0
    && coordinates.freeMonths <= coordinates.duration_months;

/**
 * Query des Erweiterungspreis-Endpunkts. `coerce`, weil Query-Parameter
 * immer als String ankommen.
 */
export const extensionPriceQuerySchema = z.object({
    quantity: z.coerce.number().int().positive(),
});
export type ExtensionPriceQuery = z.infer<typeof extensionPriceQuerySchema>;
