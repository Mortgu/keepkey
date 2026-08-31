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

export type PriceResult =
    | { ok: true; price: number; breakdown: { unitPrice: number; quantity: number; duration: number } }
    | { ok: false; reason: PriceFailureReason };

export class PriceError extends Error {
    constructor(public reason: PriceFailureReason) {
        super(`Price calculation failed: ${reason}`);
        this.name = 'PriceError';
    }
}

/**
 * Resolve the concrete cell for a given tariff, duration and quantity.
 * Returns the matching tier and cell, or a {@link PriceFailureReason}
 * describing why no cell matched. Shared between {@link selectPrice} and
 * customer-price upsert/delete so both use the same resolution rules.
 */
export function resolveCell(
    tariff: TariffForPricing | null | undefined,
    { duration, quantity }: { duration: number; quantity: number },
):
    | { ok: true; tier: TariffForPricing['tiers'][number]; cell: TariffForPricing['cells'][number] }
    | { ok: false; reason: Exclude<PriceFailureReason, 'INVALID_INPUT'> } {

    // Reihenfolge wie bisher — Laufzeit, dann Menge, dann Zelle —, damit die
    // gemeldete Ursache dieselbe bleibt. Eine Laufzeit "existiert", wenn
    // irgendeine Zelle des Tarifs sie trägt; eine eigene Spaltentabelle, die
    // das getrennt festhielte, gibt es nicht mehr.
    const hasDuration = tariff?.cells.some(c => c.duration === duration) ?? false;
    if (!hasDuration) return { ok: false, reason: 'NO_COLUMN' };

    const tier = tariff?.tiers.find(t => {
        const withinMin = quantity >= t.min_quantity;
        const noUpperLimit = t.max_quantity === null;
        const withinMax = noUpperLimit || quantity <= t.max_quantity!;
        return withinMin && withinMax;
    });
    if (!tier) return { ok: false, reason: 'NO_ROW' };

    const cell = tariff?.cells.find(c => c.duration === duration && c.min_quantity === tier.min_quantity);
    if (!cell) return { ok: false, reason: 'NO_CELL' };

    return { ok: true, tier, cell };
}

/**
 * Pure pricing logic: given an already-loaded tariff, selects the matching
 * tier (by quantity range) and cell (by duration), applies an optional
 * customer-specific override and returns the total price.
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

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) return { ok: false, reason: resolved.reason };

    let unitPrice = resolved.cell.price;

    if (customerId !== undefined && customerId !== '') {
        const overrides = tariff.customerPrices.filter(cp =>
            cp.customerId === customerId
            && cp.duration === resolved.cell.duration
            && cp.min_quantity === resolved.tier.min_quantity
        );
        const productSpecific = overrides.find(cp => cp.productId === productId);
        // Altbestand: gruppenweite Overrides (productId === null) stammen aus der
        // Zeit vor der Migration 20260803120000. Es gibt keinen Schreibpfad mehr,
        // der sie erzeugt — gelesen werden sie weiterhin.
        const groupWide = overrides.find(cp => cp.productId === null);
        const override = productSpecific ?? groupWide;
        if (override) unitPrice = override.price;
    }

    return {
        ok: true,
        price: unitPrice * quantity * duration,
        breakdown: { unitPrice, quantity, duration },
    };
}

/**
 * Laedt den Tarif zu einer Produkt/Vertrags-Kombination und bringt ihn in die
 * Form, die {@link selectPrice} erwartet. Die Tarifgruppe wird nur wegen ihrer
 * Mengenstaffeln mitgeladen — die Staffeln gehoeren ihr, nicht dem Tarif.
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
            tariffGroup: {
                select: { tiers: { orderBy: { min_quantity: 'asc' } } },
            },
        },
    });

    if (!tariff) return null;

    return { ...tariff, tiers: tariff.tariffGroup.tiers };
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
