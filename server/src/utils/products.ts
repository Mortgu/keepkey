import { prisma } from "../lib/prismaClient.js";

interface PriceCalculatorProps {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
    customerId?: string;
}

interface SelectPriceParams {
    productId?: string;
    duration: number;
    quantity: number;
    customerId?: string;
}

/**
 * Minimal tariff shape required by {@link selectPrice}.
 *
 * Koordinatenbasiert — dieselbe Form wie der Versions-Snapshot und wie
 * {@link TariffForPricing.customerPrices}. Die Laufzeitachse steckt in den
 * Zellen selbst; die Staffeln kommen von der Tarifgruppe, weil nur sie die
 * Obergrenze eines Mengenbereichs kennen.
 */
export interface TariffForPricing {
    tiers: Array<{ min_quantity: number; max_quantity: number | null }>;
    cells: Array<{ duration: number; min_quantity: number; price: number }>;
    /**
     * Kundenspezifische Stückpreise, adressiert über die stabilen Koordinaten
     * (duration, min_quantity) statt über eine cellId.
     */
    customerPrices: Array<{
        customerId: string;
        productId: string | null;
        duration: number;
        min_quantity: number;
        price: number;
    }>;
}

export type PriceFailureReason =
    | 'NO_TARIFF'
    | 'NO_COLUMN'
    | 'NO_ROW'
    | 'NO_CELL'
    | 'INVALID_INPUT';

/** Woher der Stückpreis stammt. */
export type PriceOrigin = 'list' | 'customer';

export type PriceResult =
    | {
        ok: true;
        price: number;
        breakdown: {
            unitPrice: number;
            quantity: number;
            duration: number;
            origin: PriceOrigin;
            /**
             * Listenpreis an derselben Koordinate — `null`, wenn dort keine
             * Zelle hinterlegt ist. Erst dadurch ist sichtbar, *wovon* ein
             * Kundenpreis abweicht.
             */
            listUnitPrice: number | null;
        };
    }
    | { ok: false; reason: PriceFailureReason };

export class PriceError extends Error {
    constructor(public reason: PriceFailureReason) {
        super(`Price calculation failed: ${reason}`);
        this.name = 'PriceError';
    }
}

type Tier = TariffForPricing['tiers'][number];
type CustomerPrice = TariffForPricing['customerPrices'][number];

/** Die Mengenstaffel, die eine Menge abdeckt. */
function findTier(tariff: TariffForPricing, quantity: number): Tier | undefined {
    return tariff.tiers.find(t => {
        const withinMin = quantity >= t.min_quantity;
        const withinMax = t.max_quantity === null || quantity <= t.max_quantity;
        return withinMin && withinMax;
    });
}

/**
 * Der Kundenpreis an einer Koordinate.
 *
 * Produktspezifisch geht vor gruppenweit: Letztere (`productId === null`)
 * stammen aus der Zeit vor der Migration 20260803120000 und werden nur noch
 * gelesen — es gibt keinen Schreibpfad mehr, der sie erzeugt.
 */
function findCustomerPrice(
    tariff: TariffForPricing,
    { productId, customerId, duration, min_quantity }: {
        productId?: string; customerId?: string; duration: number; min_quantity: number;
    },
): CustomerPrice | undefined {
    if (customerId === undefined || customerId === '') return undefined;

    const candidates = tariff.customerPrices.filter(cp =>
        cp.customerId === customerId && cp.duration === duration && cp.min_quantity === min_quantity
    );

    return candidates.find(cp => cp.productId === productId)
        ?? candidates.find(cp => cp.productId === null);
}

/**
 * Ermittelt den Stückpreis für Laufzeit und Menge.
 *
 * **Ein Kundenpreis ist selbst ein Preis, kein blosses Überschreiben.** Er gilt
 * deshalb auch an einer Koordinate, für die kein Listenpreis hinterlegt ist —
 * vorher lief die Auflösung erst über die Zelle und schaute danach nach
 * Overrides, wodurch ein Kundenpreis ohne Zelle nie gelesen wurde und sich ein
 * fehlender Preis nicht durch Überschreiben beheben liess.
 *
 * Die Reihenfolge der gemeldeten Ursache bleibt dieselbe wie zuvor — Laufzeit,
 * dann Menge, dann Preis —, damit bestehende Fehlermeldungen unverändert
 * bleiben. Neu ist nur, dass ein Kundenpreis die Laufzeit ebenso „existieren
 * lässt" wie eine Zelle.
 *
 * Geteilt mit dem Schreiben und Löschen von Kundenpreisen, damit dort dieselben
 * Regeln gelten.
 */
export function resolvePrice(
    tariff: TariffForPricing | null | undefined,
    { productId, customerId, duration, quantity }: {
        productId?: string; customerId?: string; duration: number; quantity: number;
    },
):
    | { ok: true; tier: Tier; unitPrice: number; origin: PriceOrigin; listUnitPrice: number | null }
    | { ok: false; reason: Exclude<PriceFailureReason, 'INVALID_INPUT'> } {

    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    const hasDuration = tariff.cells.some(c => c.duration === duration)
        || tariff.customerPrices.some(cp => cp.duration === duration && cp.customerId === customerId);
    if (!hasDuration) return { ok: false, reason: 'NO_COLUMN' };

    const tier = findTier(tariff, quantity);
    if (!tier) return { ok: false, reason: 'NO_ROW' };

    const cell = tariff.cells.find(c => c.duration === duration && c.min_quantity === tier.min_quantity);
    const listUnitPrice = cell?.price ?? null;

    const customerPrice = findCustomerPrice(tariff, {
        productId, customerId, duration, min_quantity: tier.min_quantity,
    });

    if (customerPrice) {
        return { ok: true, tier, unitPrice: customerPrice.price, origin: 'customer', listUnitPrice };
    }

    if (listUnitPrice === null) return { ok: false, reason: 'NO_CELL' };

    return { ok: true, tier, unitPrice: listUnitPrice, origin: 'list', listUnitPrice };
}

/**
 * Nur die Mengenstaffel — ohne jede Anforderung an einen vorhandenen Preis.
 *
 * Das Schreiben eines Kundenpreises braucht genau das: die Staffel bestimmt die
 * Koordinate, an der er abgelegt wird. Über {@link resolvePrice} zu gehen hiesse
 * einen Preis zu verlangen, um einen Preis setzen zu dürfen.
 */
export function resolveTier(
    tariff: TariffForPricing | null | undefined,
    quantity: number,
): { ok: true; tier: Tier } | { ok: false; reason: Exclude<PriceFailureReason, 'INVALID_INPUT'> } {
    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    const tier = findTier(tariff, quantity);
    if (!tier) return { ok: false, reason: 'NO_ROW' };

    return { ok: true, tier };
}

/**
 * Pure pricing logic: given an already-loaded tariff, resolves the unit price
 * via {@link resolvePrice} and multiplies it out. Alles Auflösen liegt dort;
 * hier bleibt nur die Rechnung.
 *
 * `price` is the unit price per piece per time unit (Stückpreis pro
 * Zeiteinheit). Total = unitPrice * quantity * duration. The `duration`
 * selects the column AND is a multiplier.
 *
 * **Immer brutto.** Freimonate kennt diese Funktion bewusst nicht: ihr Wert
 * wird überall getrennt als `discount_cents` geführt (siehe `PositionPrice` in
 * `@keepit/schemas`), netto ist die Differenz. Ein Rabatt-Parameter hier hätte
 * zwei Bedeutungen von „Gesamtpreis" nebeneinander gestellt — genau daran ist
 * die Angebots-PDF einmal auseinandergelaufen.
 *
 * Returns a discriminated union so callers can distinguish "not configured"
 * from "out of range" from "invalid input".
 */
export function selectPrice(
    tariff: TariffForPricing | null | undefined,
    { productId, duration, quantity, customerId }: SelectPriceParams,
): PriceResult {
    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    // `duration` wählt nicht nur die Spalte, sie ist auch Multiplikator — ein
    // NaN aus einem Query-Parameter lief hier bisher als NO_COLUMN auf und
    // meldete damit die falsche Ursache.
    if (!Number.isInteger(duration) || duration <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' };
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' };
    }

    const resolved = resolvePrice(tariff, { productId, customerId, duration, quantity });
    if (!resolved.ok) return { ok: false, reason: resolved.reason };

    const { unitPrice, origin, listUnitPrice } = resolved;

    return {
        ok: true,
        price: unitPrice * quantity * duration,
        breakdown: { unitPrice, quantity, duration, origin, listUnitPrice },
    };
}

/**
 * Laedt den Tarif zu einer Produkt/Vertrags-Kombination und bringt ihn in die
 * Form, die {@link selectPrice} erwartet. Die Mengenstaffeln kommen aus der
 * globalen Liste — sie sind die Zeilenachse aller Preistabellen.
 *
 * `customerId` verengt die geladenen Overrides auf einen Kunden, damit fremde
 * Kundenpreise die Datenbank nie verlassen.
 */
export async function loadTariffForPricing(productId: string, contractId: string, customerId?: string) {
    const groupProduct = await prisma.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return null;

    const tariff = await prisma.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId: groupProduct.tariffGroupId, contractId } },
        include: {
            cells: { orderBy: [{ duration: 'asc' }, { min_quantity: 'asc' }] },
            customerPrices: customerId ? { where: { customerId } } : true,
        },
    });

    if (!tariff) return null;

    const tiers = await prisma.standardTier.findMany({ orderBy: { min_quantity: 'asc' } });

    return { ...tariff, tiers };
}

export async function calculatePrice(props: PriceCalculatorProps): Promise<PriceResult> {
    const { productId, contractId, duration, quantity, customerId } = props;

    const tariff = await loadTariffForPricing(productId, contractId, customerId);

    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    return selectPrice(tariff, { productId, duration, quantity, customerId });
}

/**
 * Convenience wrapper for callers that only need the numeric price.
 * Throws a {@link PriceError} when the tariff is not fully configured or
 * the inputs are invalid — prevents silently storing `total_cents: 0`.
 */
export async function calculatePriceOrThrow(props: PriceCalculatorProps): Promise<number> {
    const result = await calculatePrice(props);
    if (!result.ok) throw new PriceError(result.reason);
    return result.price;
}
