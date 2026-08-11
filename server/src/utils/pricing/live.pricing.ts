import resolveCell from "./resolve_cell.js";
import { TariffForPricing } from "@keepit/schemas";


interface Props {
    tariff: TariffForPricing;
    customerId: string;
    productId: string;
    duration: number;
    quantity: number;
    free_months: number;
}

type ResultTrue = {
    ok: true;

    unit: number;
    discount: number;

    total: number;
    totalDiscounted: number
}

type ResultFalse = {
    ok: false;
    reason: string;
}

type Result =
    | ResultTrue
    | ResultFalse;

/* */

export function selectPrice({ tariff, customerId, productId, duration, quantity, free_months }: Props): Result {
    if (!Number.isInteger(duration) || duration <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' }
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return { ok: false, reason: 'INVALID_INPUT' }
    }

    const resolvedCell = resolveCell({ tariff, duration, quantity });

    if (!resolvedCell.ok) {
        return { ok: false, reason: "NO_CELL" };
    }

    const cell = resolvedCell.cell;
    const defaultCell = cell?.default_cells[0];

    if (!defaultCell) {
        return { ok: false, reason: "NO_DEFAULT" };
    }

    let unitPrice = defaultCell.price;

    if (customerId !== undefined && customerId !== '') {
        const overrides = tariff.customerPrices.filter(cp =>
            cp.customerId === customerId
            && cp.duration === resolvedCell.column?.duration
            && cp.min_quantity === resolvedCell.row?.min_quantity
        );
        const productSpecific = overrides.find(cp => cp.productId === productId);
        const groupSpecific = overrides.find(cp => cp.productId === null); // @deprecated ?

        const override = productSpecific ?? groupSpecific;

        if (override) unitPrice = override.price;
    }

    return {
        ok: true,
        unit: unitPrice,
        discount: unitPrice * quantity * free_months,

        total: unitPrice * quantity * duration,
        totalDiscounted: unitPrice * quantity * (duration - free_months),
    }
}