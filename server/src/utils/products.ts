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
}

interface SelectPriceParams {
    duration: number;
    quantity: number;
    customerId?: string;
}

/** Minimal tariff shape required by {@link selectPrice}. */
export interface TariffForPricing {
    columns: Array<{ id: string; duration: number }>;
    rows: Array<{ id: string; min_quantity: number; max_quantity: number | null }>;
    cells: Array<{
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
    | { ok: true; price: number; breakdown: { unitPrice: number; quantity: number; duration: number } }
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
export function selectPrice(
    tariff: TariffForPricing | null | undefined,
    { duration, quantity, customerId }: SelectPriceParams,
): PriceResult {
    if (!tariff) return { ok: false, reason: 'NO_TARIFF' };

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' };
    }

    const column = tariff.columns.find(c => c.duration === duration);
    if (!column) return { ok: false, reason: 'NO_COLUMN' };

    const row = tariff.rows.find(r => {
        const withinMin = quantity >= r.min_quantity;
        const noUpperLimit = r.max_quantity === null;
        const withinMax = noUpperLimit || quantity <= r.max_quantity!;
        return withinMin && withinMax;
    });
    if (!row) return { ok: false, reason: 'NO_ROW' };

    const cell = tariff.cells.find(c => c.rowId === row.id && c.columnId === column.id);
    if (!cell) return { ok: false, reason: 'NO_CELL' };

    const defaultCell = cell.default_cells[0];
    if (!defaultCell) return { ok: false, reason: 'NO_DEFAULT' };

    let unitPrice = defaultCell.price;

    if (customerId !== undefined && customerId !== '') {
        const override = cell.customer_cells.find(cc => cc.customerId === customerId);
        if (override) unitPrice = override.price;
    }

    return {
        ok: true,
        price: unitPrice * quantity * duration,
        breakdown: { unitPrice, quantity, duration },
    };
}

export async function snapshotTariff(productId: string, contractId: string) {
    const groupProduct = await prisma.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return;

    const { tariffGroupId } = groupProduct;

    const tariff = await prisma.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId, contractId } },
        include: TARIFF_SNAPSHOT_INCLUDE,
    });

    if (!tariff) return;

    const versionCount = await prisma.tariffHistory.count({
        where: { productId, contractId },
    });

    await prisma.tariffHistory.create({
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

export async function calculatePrice(props: PriceCalculatorProps): Promise<PriceResult> {
    const { productId, contractId, duration, quantity, customerId } = props;

    try {
        const groupProduct = await prisma.tariffGroupProduct.findUnique({
            where: { productId },
        });

        if (!groupProduct) return { ok: false, reason: 'NO_TARIFF' };

        const { tariffGroupId } = groupProduct;

        const tariff = await prisma.tariff.findUnique({
            where: { tariffGroupId_contractId: { tariffGroupId, contractId } },
            include: CALCULATE_PRICE_INCLUDE,
        });

        return selectPrice(tariff, { duration, quantity, customerId });
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
