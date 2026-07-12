import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import {
    calculatePrice,
    loadTariffForPricing,
    resolveCell,
    selectPrice,
    snapshotTariff,
    type PriceFailureReason,
} from "../utils/products.js";

/* ========== Types ========== */

export type CreateTariffInput = { contractId: string };
export type CreateTariffColumnInput = { duration: number };
export type UpdateTariffColumnInput = { duration?: number };
export type CreateTariffRowInput = { min_quantity: number; max_quantity: number };
export type UpdateTariffRowInput = { min_qty?: number; max_qty?: number };
export type UpdateTariffCellInput = { default_price?: number; customer_price?: number; customerId?: string };
export type CreateTariffGroupInput = { products: string[] };
export type UpdateTariffGroupInput = { products?: string[] };
export type UpsertCustomerPriceInput = {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
    customerId: string;
    price: number;
};
export type DeleteCustomerPriceInput = {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
    customerId: string;
};

const TARIFF_INCLUDE = {
    contract: {
        include: {
            translations: true
        }
    },
    tariffGroup: {
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            translations: true
                        }
                    }
                }
            }
        }
    },
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
        }
    }
} as const;

const TARIFF_GROUP_INCLUDE = {
    products: {
        include: {
            product: {
                include: {
                    translations: true,
                },
            },
        },
    },
    tariffs: {
        include: {
            contract: {
                include: {
                    translations: true,
                },
            },
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
        },
    },
} as const;

const CUSTOMER_PRICE_MESSAGE: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, string> = {
    NO_TARIFF: "Tariff für das Produkt/den Vertrag wurde nicht gefunden.",
    NO_CELL: "Keine Zelle für die gewählte Zeile/Spalte konfiguriert.",
    NO_DEFAULT: "Kein Default-Preis für die Zelle hinterlegt.",
    NO_COLUMN: "Laufzeit ist in keiner Tariff-Spalte konfiguriert.",
    NO_ROW: "Menge liegt außerhalb aller konfigurierten Mengenbereiche.",
};

const CUSTOMER_PRICE_STATUS: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, number> = {
    NO_TARIFF: 404,
    NO_CELL: 404,
    NO_DEFAULT: 404,
    NO_COLUMN: 422,
    NO_ROW: 422,
};

/* ========== Queries ========== */

export async function getTariffGroups() {
    return prisma.tariffGroup.findMany({
        include: TARIFF_GROUP_INCLUDE,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
}

export async function getTariffGroup(id: string) {
    const group = await prisma.tariffGroup.findUnique({
        where: { id },
        include: TARIFF_GROUP_INCLUDE,
    });

    if (!group) {
        throw new AppException("TariffGroup not found.", 404, "TARIFF_GROUP_NOT_FOUND");
    }

    return group;
}

export async function getTariff(tariffId: string) {
    const tariff = await prisma.tariff.findUnique({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });

    if (!tariff) {
        throw new AppException("Tariff not found.", 404, "TARIFF_NOT_FOUND");
    }

    return tariff;
}

export async function getTariffHistory(productId: string, contractId: string) {
    return prisma.tariffHistory.findMany({
        where: { productId, contractId },
        orderBy: { version: 'desc' },
    });
}

export async function getTariffDurations(productId: string, contractId: string): Promise<number[]> {
    const groupProduct = await prisma.tariffGroupProduct.findUnique({
        where: { productId },
    });

    if (!groupProduct) return [];

    const tariff = await prisma.tariff.findUnique({
        where: { tariffGroupId_contractId: { tariffGroupId: groupProduct.tariffGroupId, contractId } },
        select: { columns: { select: { duration: true }, orderBy: { createdAt: 'asc' } } },
    });

    if (!tariff) return [];
    return tariff.columns.map(c => c.duration);
}

export async function getTariffPrice(
    productId: string,
    contractId: string,
    duration: number,
    quantity: number,
    customerId?: string,
    freeMonths?: number
) {
    const result = await calculatePrice({
        productId,
        contractId,
        duration,
        quantity,
        customerId,
        freeMonths: freeMonths ?? 0,
    });

    if (!result.ok) {
        if (result.reason === 'INVALID_INPUT') {
            throw new AppException(
                "duration und quantity müssen positive Ganzzahlen sein.",
                400,
                "INVALID_INPUT"
            );
        }

        const status = CUSTOMER_PRICE_STATUS[result.reason];
        const message = CUSTOMER_PRICE_MESSAGE[result.reason];
        throw new AppException(message, status, result.reason);
    }

    return {
        price: result.price,
        breakdown: result.breakdown,
    };
}

/* ========== Mutations ========== */

export async function createTariffGroup(input: CreateTariffGroupInput) {
    const { products } = input;

    const contracts = await prisma.contract.findMany({ select: { id: true } });

    const group = await prisma.$transaction(async (tx) => {
        const created = await tx.tariffGroup.create({
            data: {
                products: {
                    create: products.map(productId => ({ productId })),
                },
            },
        });

        if (contracts.length > 0) {
            await tx.tariff.createMany({
                data: contracts.map(c => ({
                    tariffGroupId: created.id,
                    contractId: c.id,
                })),
            });
        }

        return created;
    });

    return prisma.tariffGroup.findUniqueOrThrow({
        where: { id: group.id },
        include: TARIFF_GROUP_INCLUDE,
    });
}

export async function updateTariffGroup(id: string, input: UpdateTariffGroupInput) {
    const { products } = input;

    if (products !== undefined) {
        await prisma.tariffGroupProduct.deleteMany({
            where: { tariffGroupId: id },
        });

        if (products.length > 0) {
            await prisma.tariffGroup.update({
                where: { id },
                data: {
                    products: {
                        create: products.map(productId => ({ productId })),
                    },
                },
            });
        }
    }

    return prisma.tariffGroup.findUniqueOrThrow({
        where: { id },
        include: TARIFF_GROUP_INCLUDE,
    });
}

export async function deleteTariffGroup(id: string): Promise<void> {
    await prisma.tariffGroup.delete({
        where: { id },
    });
}

export async function createTariff(tariffGroupId: string, input: CreateTariffInput) {
    const { contractId } = input;

    return prisma.$transaction(async (tx) => {
        const existing = await tx.tariff.findFirst({
            where: { tariffGroupId, contractId },
        });

        if (existing) {
            const groupProduct = await tx.tariffGroupProduct.findFirst({
                where: { tariffGroupId },
            });
            const productId = groupProduct?.productId ?? "";
            await snapshotTariff(productId, contractId, tx);
            await tx.tariff.delete({ where: { id: existing.id } });
        }

        const tariff = await tx.tariff.create({
            data: {
                tariffGroupId,
                contractId,
            },
        });

        return tx.tariff.findUniqueOrThrow({
            where: { id: tariff.id },
            include: TARIFF_INCLUDE,
        });
    });
}

export async function deleteTariff(tariffId: string): Promise<void> {
    await prisma.tariff.delete({
        where: { id: tariffId }
    });
}

export async function createTariffColumn(tariffId: string, input: CreateTariffColumnInput) {
    const { duration } = input;

    const tariff = await prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: {
            rows: true,
            columns: { select: { order: true }, orderBy: { order: 'asc' } },
        }
    });

    const nextOrder = tariff.columns.length;

    await prisma.$transaction(async (tx) => {
        const col = await tx.tariffColumn.create({
            data: { tariffId, duration, order: nextOrder },
        });

        const cells = await tx.tariffCell.createManyAndReturn({
            data: tariff.rows.map((row) => ({
                tariffId,
                rowId: row.id,
                columnId: col.id,
            })),
            select: { id: true },
        });

        await tx.tariffCellDefault.createMany({
            data: cells.map((cell) => ({ cellId: cell.id, price: 1 })),
        });
    });

    return prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });
}

export async function updateTariffColumn(columnId: string, input: UpdateTariffColumnInput) {
    const { duration } = input;

    return prisma.tariffColumn.updateManyAndReturn({
        where: { id: columnId },
        data: { duration }
    });
}

export async function deleteTariffColumn(columnId: string) {
    return prisma.tariffColumn.delete({
        where: { id: columnId }
    });
}

export async function createTariffRow(tariffId: string, input: CreateTariffRowInput) {
    const { min_quantity, max_quantity } = input;

    const tariff = await prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: {
            columns: true,
            rows: { select: { order: true }, orderBy: { order: 'asc' } },
        }
    });

    const nextOrder = tariff.rows.length;

    await prisma.$transaction(async (tx) => {
        const r = await tx.tariffRow.create({
            data: { tariffId, min_quantity, max_quantity, order: nextOrder },
        });

        const cells = await tx.tariffCell.createManyAndReturn({
            data: tariff.columns.map((column) => ({
                tariffId,
                rowId: r.id,
                columnId: column.id,
            })),
            select: { id: true },
        });

        await tx.tariffCellDefault.createMany({
            data: cells.map((cell) => ({ cellId: cell.id, price: 1 })),
        });
    });

    return prisma.tariff.findUniqueOrThrow({
        where: { id: tariffId },
        include: TARIFF_INCLUDE,
    });
}

export async function updateTariffRow(rowId: string, input: UpdateTariffRowInput) {
    const { min_qty, max_qty } = input;

    return prisma.tariffRow.updateManyAndReturn({
        where: { id: rowId },
        data: {
            min_quantity: min_qty,
            max_quantity: max_qty
        }
    });
}

export async function deleteTariffRow(rowId: string) {
    return prisma.tariffRow.delete({
        where: { id: rowId },
    });
}

export async function updateTariffCell(cellId: string, input: UpdateTariffCellInput) {
    const { default_price, customer_price, customerId } = input;

    if (default_price !== undefined) {
        return prisma.tariffCellDefault.updateManyAndReturn({
            where: { cellId },
            data: { price: default_price }
        });
    }

    if (customer_price !== undefined && customerId) {
        const existing = await prisma.tariffCellCustomer.findFirst({
            where: { cellId, customerId, productId: null },
        });
        if (existing) {
            return prisma.tariffCellCustomer.update({
                where: { id: existing.id },
                data: { price: customer_price },
            });
        }
        return prisma.tariffCellCustomer.create({
            data: { cellId, customerId, productId: null, price: customer_price },
        });
    }

    throw new AppException("Bad request!", 400, "MISSING_PRICE");
}

export async function upsertCustomerPrice(input: UpsertCustomerPriceInput) {
    const { productId, contractId, duration, quantity, customerId, price } = input;

    const tariff = await loadTariffForPricing(productId, contractId);

    if (!tariff) {
        throw new AppException(
            CUSTOMER_PRICE_MESSAGE.NO_TARIFF,
            CUSTOMER_PRICE_STATUS.NO_TARIFF,
            "NO_TARIFF"
        );
    }

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) {
        throw new AppException(
            CUSTOMER_PRICE_MESSAGE[resolved.reason],
            CUSTOMER_PRICE_STATUS[resolved.reason],
            resolved.reason
        );
    }

    const cellId = resolved.cell.id;

    await prisma.tariffCellCustomer.upsert({
        where: { cellId_customerId_productId: { cellId, customerId, productId } },
        create: { cellId, customerId, productId, price },
        update: { price },
    });

    const result = selectPrice(tariff, { productId, duration, quantity, customerId });

    if (!result.ok) {
        throw new AppException(
            "Override gespeichert, aber Preis konnte nicht neu berechnet werden.",
            500,
            result.reason
        );
    }

    return {
        price: result.price,
        breakdown: result.breakdown,
    };
}

export async function deleteCustomerPrice(input: DeleteCustomerPriceInput) {
    const { productId, contractId, duration, quantity, customerId } = input;

    const tariff = await loadTariffForPricing(productId, contractId);

    if (!tariff) {
        throw new AppException(
            CUSTOMER_PRICE_MESSAGE.NO_TARIFF,
            CUSTOMER_PRICE_STATUS.NO_TARIFF,
            "NO_TARIFF"
        );
    }

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) {
        throw new AppException(
            CUSTOMER_PRICE_MESSAGE[resolved.reason],
            CUSTOMER_PRICE_STATUS[resolved.reason],
            resolved.reason
        );
    }

    const cellId = resolved.cell.id;

    await prisma.tariffCellCustomer.deleteMany({
        where: { cellId, customerId, productId },
    });

    const result = selectPrice(tariff, { productId, duration, quantity, customerId });

    if (!result.ok) {
        throw new AppException(
            "Override gelöscht, aber Default-Preis konnte nicht berechnet werden.",
            500,
            result.reason
        );
    }

    return {
        price: result.price,
        breakdown: result.breakdown,
    };
}
