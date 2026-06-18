import {prisma} from "../lib/prismaClient.js";

const TARIFF_SNAPSHOT_INCLUDE = {
    rows: {
        orderBy: {createdAt: 'asc'},
    },
    columns: {
        orderBy: {createdAt: 'asc'},
    },
    cells: {
        orderBy: {createdAt: 'asc'},
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

export async function snapshotTariff(productId: string, contractId: string) {
    const tariff = await prisma.tariff.findFirst({
        where: {productId, contractId},
        include: TARIFF_SNAPSHOT_INCLUDE,
    });

    if (!tariff) return;

    const versionCount = await prisma.tariffHistory.count({
        where: {productId, contractId},
    });

    await prisma.tariffHistory.create({
        data: {
            productId,
            contractId,
            version: versionCount + 1,
            snapshot: tariff as any,
        },
    });
}

export default async function calculatePrice(props: PriceCalculatorProps): Promise<number> {
    const {productId, contractId, duration, quantity, customerId} = props;

    const tariff = await prisma.tariff.findUnique({
        where: {productId_contractId: {productId, contractId}},
        include: {
            rows: true,
            columns: true,
            cells: {
                include: {
                    default_cells: true,
                    customer_cells: true,
                },
            },
        },
    });

    if (!tariff) return 0;

    const column = tariff.columns.find(c => c.duration === duration);
    if (!column) return 0;

    const row = tariff.rows.find(r => {
        const withinMin = quantity >= r.min_quantity;
        const noUpperLimit = r.max_quantity === null;
        const withinMax = noUpperLimit || quantity <= r.max_quantity!;
        return withinMin && withinMax;
    });
    if (!row) return 0;

    const cell = tariff.cells.find(c => c.rowId === row.id && c.columnId === column.id);
    if (!cell) return 0;

    const defaultCell = cell.default_cells[0];
    if (!defaultCell) return 0;

    let price = defaultCell.price;

    if (customerId) {
        const override = cell.customer_cells.find(cc => cc.customerId === customerId);
        if (override) price = override.price;
    }

    return price * quantity * duration;
}
