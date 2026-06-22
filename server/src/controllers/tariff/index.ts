import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import calculatePrice, { snapshotTariff } from "../../utils/products.js";
import logger from "../../middlewares/logger.js";

const TARIFF_INCLUDE = {
    contract: {
        include: {
            translations: true
        }
    },
    product: {
        include: {
            translations: true
        }
    },
    rows: {
        orderBy: { createdAt: 'asc' },
    },
    columns: {
        orderBy: { createdAt: 'asc' },
    },
    cells: {
        orderBy: { createdAt: 'asc' },
        include: {
            default_cells: true,
            customer_cells: true,
        }
    }
} as const;

export async function getTariffs(request: Request, response: Response) {
    const tariffs = await prisma.tariff.findMany({
        include: TARIFF_INCLUDE,
    });

    return response.status(200).json(tariffs);
}

export async function getTariffById(request: Request, response: Response) {
    const id = request.params.tariffId as string;

    const tariff = await prisma.tariff.findUnique({
        where: { id },
        include: TARIFF_INCLUDE,
    });

    if (!tariff) {
        return response.status(404).json({ success: false, message: "Tariff not found." });
    }

    return response.status(200).json(tariff);
}

export async function getProductTariffs(request: Request, response: Response) {
    const productId = request.params.productId as string;

    const tariff = await prisma.tariff.findMany({
        where: { productId },
        include: TARIFF_INCLUDE,
        orderBy: {
            createdAt: "desc",
        },
    });

    return response.status(200).json(tariff);
}

export async function createTariff(request: Request, response: Response, next: NextFunction) {
    const { productId, contractId } = request.body;

    try {
        const existing = await prisma.tariff.findFirst({
            where: { productId, contractId },
        });

        if (existing) {
            await snapshotTariff(productId, contractId);
            await prisma.tariff.delete({ where: { id: existing.id } });
        }

        const tariff = await prisma.tariff.create({
            data: {
                productId,
                contractId,
            },
        });

        const result = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariff.id },
            include: TARIFF_INCLUDE,
        });

        return response.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function deleteTariff(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;

    try {
        await prisma.tariff.delete({
            where: { id: tariffId }
        });

        return response.status(200).json({
            success: true, message: "Tariff deleted."
        });
    } catch (error) {
        next(error);
    }
}

export const getTariffPrice = async (request: Request, response: Response) => {
    const { productId, contractId, duration, quantity, customerId } = request.query;

    if (!productId || !contractId || !duration || !quantity) {
        return response.status(400).json({
            message: "productId, contractId, duration und quantity sind erforderlich.",
        });
    }

    const durationNum = parseInt(duration as string);
    const quantityNum = parseInt(quantity as string);
    if (!Number.isFinite(durationNum) || !Number.isFinite(quantityNum)) {
        return response.status(400).json({
            message: "duration und quantity müssen Ganzzahlen sein.",
        });
    }

    const price = await calculatePrice({
        productId: productId as string,
        contractId: contractId as string,
        duration: durationNum,
        quantity: quantityNum,
        customerId: customerId as string | undefined,
    });

    console.log("price", price);

    return response.status(200).json(price);
};


export async function createTariffColumn(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;

    const duration = request.body.duration;

    try {
        const tariff = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: { rows: true }
        });

        const column = await prisma.$transaction(async (tx) => {
            const col = await tx.tariffColumn.create({
                data: { tariffId, duration },
            });

            for (const row of tariff.rows) {
                const cell = await tx.tariffCell.create({
                    data: {
                        tariffId,
                        rowId: row.id,
                        columnId: col.id
                    },
                });

                await tx.tariffCellDefault.create({
                    data: { cellId: cell.id, price: 1 }
                })
            }

            return col;
        });

        const updated = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: TARIFF_INCLUDE,
        });

        return response.status(201).json(updated);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function deleteTariffColumn(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const columnId = request.params.columnId as string;

    try {
        const deletedColumn = await prisma.tariffColumn.delete({
            where: { id: columnId }
        });

        return response.status(200).json({
            message: 'Column deleted successfully!', column: deletedColumn,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateTariffColumn(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const columnId = request.params.columnId as string;

    const duration = request.body.duration;

    try {
        const updated = await prisma.tariffColumn.updateManyAndReturn({
            where: { id: columnId },
            data: {
                duration
            }
        });

        return response.status(200).json({
            message: 'Column updated successfully!', updated
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}


export async function createTariffRow(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;

    const { min_quantity, max_quantity } = request.body;

    try {
        const tariff = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: { columns: true }
        });

        const row = await prisma.$transaction(async (tx) => {
            const r = await tx.tariffRow.create({
                data: { tariffId, min_quantity, max_quantity },
            });

            for (const column of tariff.columns) {
                const cell = await tx.tariffCell.create({
                    data: {
                        tariffId,
                        rowId: r.id,
                        columnId: column.id
                    },
                });

                await tx.tariffCellDefault.create({
                    data: { cellId: cell.id, price: 1 }
                })
            }

            return r;
        });

        const updated = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: TARIFF_INCLUDE,
        });

        return response.status(201).json(updated);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function deleteTariffRow(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const rowId = request.params.rowId as string;

    try {
        const deletedRow = await prisma.tariffRow.delete({
            where: { id: rowId },
        });

        return response.status(201).json({
            message: "Successfully deleted row!", row: deletedRow,
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function updateTariffRow(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const rowId = request.params.rowId as string;

    const { min_qty, max_qty } = request.body;

    try {
        const updated = await prisma.tariffRow.updateManyAndReturn({
            where: { id: rowId },
            data: {
                min_quantity: min_qty,
                max_quantity: max_qty
            }
        });

        return response.status(200).json({
            message: 'Row updated successfully!', updated
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function updateTariffCell(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const cellId = request.params.cellId as string;

    const { default_price, customer_price } = request.body;

    if (default_price === undefined && customer_price === undefined) {
        logger.error("default_price or customer_price is required");
        return response.status(400).json({
            message: "Bad request!"
        });
    }

    try {
        if (default_price !== undefined) {
            const updated = await prisma.tariffCellDefault.updateManyAndReturn({
                where: { cellId: cellId },
                data: {
                    price: default_price,
                }
            });

            return response.status(200).json({
                message: 'Cell updated successfully!', updated
            });
        }

        if (customer_price !== undefined) {
            const updated = await prisma.tariffCellCustomer.updateManyAndReturn({
                where: { cellId: cellId },
                data: {
                    price: customer_price,
                }
            });

            return response.status(200).json({
                message: 'Cell updated successfully!', updated
            });
        }
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function getTariffHistory(request: Request, response: Response, next: NextFunction) {
    const productId = request.params.productId as string;
    const contractId = request.params.contractId as string;

    try {
        const history = await prisma.tariffHistory.findMany({
            where: { productId, contractId },
            orderBy: { version: 'desc' },
        });

        return response.status(200).json(history);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function getTariffDurations(request: Request, response: Response, next: NextFunction) {
    const productId = request.params.productId as string;
    const contractId = request.params.contractId as string;

    try {
        const tariff = await prisma.tariff.findUnique({
            where: { productId_contractId: { productId, contractId } },
            select: { columns: { select: { duration: true }, orderBy: { createdAt: 'asc' } } },
        });

        if (!tariff) return response.status(200).json([]);
        return response.status(200).json(tariff.columns.map(c => c.duration));
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}
