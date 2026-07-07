import { prisma } from "../lib/prismaClient.js";

const TARIFF_SNAPSHOT_INCLUDE = {
    rows: {
        orderBy: { order: 'asc' },
    },
    columns: {
        orderBy: { order: 'asc' },
    },
    cells: {
        orderBy: { createdAt: 'asc' },
        include: {
            default_cells: true,
            customer_cells: true,
        },
    },
} as const;

interface PriceCalculatorProps {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
    customerId?: string;
    freeMonths?: number;
}

interface SelectPriceParams {
    duration: number;
    quantity: number;
    customerId?: string;
    freeMonths?: number;
}

/** Minimal tariff shape required by {@link selectPrice}. */
export interface TariffForPricing {
    columns: Array<{ id: string; duration: number }>;
    rows: Array<{ id: string; min_quantity: number; max_quantity: number | null }>;
    cells: Array<{
        id: string;
        rowId: string;
        columnId: string;
        default_cells: Array<{ price: number }>;
        customer_cells: Array<{ customerId: string; price: number }>;
    }>;
}

export type PriceFailureReason =
    | 'NO_TARIFF'
    | 'NO_COLUMN'
    | 'NO_ROW'
    | 'NO_CELL'
    | 'NO_DEFAULT'
    | 'INVALID_INPUT';

export type PriceResult =
    | { ok: true; price: number; breakdown: { unitPrice: number; quantity: number; duration: number; freeMonths: number; effectiveDuration: number } }
    | { ok: false; reason: PriceFailureReason };

export class PriceError extends Error {
    constructor(public reason: PriceFailureReason) {
        super(`Price calculation failed: ${reason}`);
        this.name = 'PriceError';
    }
}

/**
 * Pure pricing logic: given an already-loaded tariff, selects the matching
 * column (by duration), row (by quantity range) and cell, applies an optional
 * customer-specific override and returns the total price.
 *
 * `price` is the unit price per piece per time unit (Stückpreis pro
 * Zeiteinheit). Total = unitPrice * quantity * duration. The `duration`
 * selects the column AND is a multiplier.
 *
 * Returns a discriminated union so callers can distinguish "not configured"
 * from "out of range" from "invalid input".
 */
/**
 * Resolve the concrete cell for a given tariff, duration and quantity.
 * Returns the matching column, row and cell, or a {@link PriceFailureReason}
 * describing why no cell matched. Shared between {@link selectPrice} and
 * customer-price upsert/delete so both use the same resolution rules.
 */
export function resolveCell(
    tariff: TariffForPricing | null | undefined,
    { duration, quantity }: { duration: number; quantity: number },
):
    | { ok: true; column: TariffForPricing['columns'][number]; row: TariffForPricing['rows'][number]; cell: TariffForPricing['cells'][number] }
    | { ok: false; reason: Exclude<PriceFailureReason, 'INVALID_INPUT'> } {

    const column = tariff?.columns.find(c => c.duration === duration);
    if (!column) return { ok: false, reason: 'NO_COLUMN' };

    const row = tariff?.rows.find(r => {
        const withinMin = quantity >= r.min_quantity;
        const noUpperLimit = r.max_quantity === null;
        const withinMax = noUpperLimit || quantity <= r.max_quantity!;
        return withinMin && withinMax;
    });
    if (!row) return { ok: false, reason: 'NO_ROW' };

    const cell = tariff?.cells.find(c => c.rowId === row.id && c.columnId === column.id);
    if (!cell) return { ok: false, reason: 'NO_CELL' };

    return { ok: true, column, row, cell };
}

export function selectPrice(
    tariff: TariffForPricing | null | undefined,
    { duration, quantity, customerId, freeMonths = 0 }: SelectPriceParams,
): PriceResult {
    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' };
    }

    if (!Number.isInteger(freeMonths) || freeMonths < 0 || freeMonths > duration) {
        return { ok: false, reason: 'INVALID_INPUT' };
    }

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) return { ok: false, reason: resolved.reason };

    const cell = resolved.cell;

    const defaultCell = cell.default_cells[0];
    if (!defaultCell) return { ok: false, reason: 'NO_DEFAULT' };

    let unitPrice = defaultCell.price;

    if (customerId !== undefined && customerId !== '') {
        const override = cell.customer_cells.find(cc => cc.customerId === customerId);
        if (override) unitPrice = override.price;
    }

    const effectiveDuration = duration - freeMonths;

    return {
        ok: true,
        price: unitPrice * quantity * effectiveDuration,
        breakdown: { unitPrice, quantity, duration, freeMonths, effectiveDuration },
    };
}

export async function snapshotTariff(productId: string, contractId: string, tx: any = prisma) {
    const groupProduct = await tx.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return;

    const { tariffGroupId } = groupProduct;

    const tariff = await tx.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId, contractId } },
        include: TARIFF_SNAPSHOT_INCLUDE,
    });

    if (!tariff) return;

    const versionCount = await tx.tariffHistory.count({
        where: { productId, contractId },
    });

    await tx.tariffHistory.create({
        data: {
            productId,
            contractId,
            version: versionCount + 1,
            snapshot: tariff as object,
        },
    });
}

const CALCULATE_PRICE_INCLUDE = {
    rows: {
        orderBy: { order: 'asc' },
    },
    columns: {
        orderBy: { order: 'asc' },
    },
    cells: {
        orderBy: { createdAt: 'asc' },
        include: {
            default_cells: true,
            customer_cells: true,
        },
    },
} as const;

/**
 * Loads the tariff (with default + customer cells) for a product/contract
 * combination, resolving the tariff group via {@link TariffGroupProduct}.
 * Returns `null` when no tariff is configured.
 */
export async function loadTariffForPricing(productId: string, contractId: string) {
    const groupProduct = await prisma.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return null;

    return prisma.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId: groupProduct.tariffGroupId, contractId } },
        include: CALCULATE_PRICE_INCLUDE,
    });
}

export async function calculatePrice(props: PriceCalculatorProps): Promise<PriceResult> {
    const { productId, contractId, duration, quantity, customerId, freeMonths } = props;

    try {
        const tariff = await loadTariffForPricing(productId, contractId);

        if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

        return selectPrice(tariff, { duration, quantity, customerId, freeMonths });
    } catch (error) {
        throw error;
    }
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
