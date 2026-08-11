import { z } from "zod";

export const tariffForPricing = z.object({
    columns: z.array(z.object({
        id: z.string(),
        duration: z.int().positive(),
    })),
    rows: z.array(z.object({
        id: z.string(),
        min_quantity: z.int().positive(),
        max_quantity: z.int().positive().nullable(),
    })),
    cells: z.array(z.object({
        id: z.string(),
        rowId: z.string(),
        columnId: z.string(),
        default_cells: z.array(z.object({
            price: z.int().positive()
        }))
    })),
    customerPrices: z.array(z.object({
        customerId: z.string(),
        productId: z.string().nullable(),
        duration: z.int().positive(),
        min_quantity: z.int().positive(),
        price: z.int().positive(),
    })),
});
export type TariffForPricing = z.infer<typeof tariffForPricing>;

/**  Koordinaten für Live-Preis */
export const livePriceQuerySchema = z.object({
    customerId: z.string().min(1),
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    free_months: z.coerce.number().int().min(0),
});
export type LivePriceQuery = z.infer<typeof livePriceQuerySchema>;

/** Identifikation einer angepinnten Quellposition. */
export const pinnedPriceQuerySchema = z.object({
    customerId: z.string().min(1),
    positionId: z.string().min(1),

    duration: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    free_months: z.coerce.number().int().min(0).optional(),
});
export type PinnedPriceQuery = z.infer<typeof pinnedPriceQuerySchema>;

/**
 * Preis einer Angebotsposition — einheitlich für alle Preisquellen.
 *
 * Es gibt zwei Quellen, die dieselbe Form liefern:
 *
 * - **live**: der aktuell gültige Tarif (`GET /api/tariffs/price`).
 * - **pinned**: die Tarif-Version, die eine bestehende Position angepinnt hat
 *   (`GET /api/offers/:offerId/positions/:positionId/extension-price`).
 *
 * `total_cents` ist **brutto**, also `eur_user_month * quantity * duration`
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

/** true, wenn die Koordinaten vollständig sind und abgefragt werden dürfen. */
export const isLivePriceable = (query: LivePriceQuery): boolean =>
    Boolean(query.customerId)
    && Boolean(query.productId)
    && Boolean(query.contractId)
    && Number.isInteger(query.quantity) && query.quantity > 0
    && Number.isInteger(query.duration) && query.duration > 0
    && Number.isInteger(query.free_months) && query.free_months >= 0
    && query.free_months <= query.duration;


export const calculatedPositionPriceResultSchema = z.object({
    ok: z.boolean(),

    unit: z.int().positive(),
    discount: z.int().positive(),

    // Preis ohne abzüge (unit * quantity * duration)
    price: z.int().positive(),

    // Preis abzüglich des rabatts (free_months) einer Position
    // (unit * quantity * (duration - free_months))
    discountedPrice: z.int().positive(),
});
export type CalculatedPositionPriceResult = z.infer<typeof calculatedPositionPriceResultSchema>;