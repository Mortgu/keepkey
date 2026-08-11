import { TariffForPricing } from "@keepit/schemas";

interface Props {
    tariff: TariffForPricing;
    duration: number;
    quantity: number;
}

type ResultTrue = {
    ok: true;
    column?: TariffForPricing['columns'][number];
    row?: TariffForPricing['rows'][number];
    cell?: TariffForPricing['cells'][number];
}

type ResultFalse = {
    ok: false;
    reason: string;
}

type Result =
    | ResultTrue
    | ResultFalse;

export default function resolveCell({ tariff, duration, quantity }: Props): Result {
    const column = tariff.columns.find(column => column.duration === duration);

    if (!column) {
        return {
            ok: false,
            reason: 'NO_COLUMN'
        }
    }

    const row = tariff.rows.find(row => {
        const withinMin = quantity >= row.min_quantity;
        const noUpperLimit = row.max_quantity === null;
        const withinMax = noUpperLimit || quantity <= row.max_quantity!;

        return withinMin && withinMax;
    });

    if (!row) {
        return {
            ok: false,
            reason: 'NO_ROW'
        }
    }

    const cell = tariff.cells.find(cell => cell.rowId === row.id && cell.columnId === column.id);

    if (!cell) {
        return {
            ok: false,
            reason: 'NO_CELL'
        }
    }

    return {
        ok: true,
        column: column,
        row: row,
        cell: cell,
    }
}
