import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import { calculatePrice, snapshotTariff, type PriceFailureReason } from "../../utils/products.js";
import logger from "../../middlewares/logger.js";

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

export async function getTariff(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;

    try {
        const tariff = await prisma.tariff.findUnique({
            where: { id: tariffId },
            include: TARIFF_INCLUDE,
        });

        if (!tariff) {
            return response.status(404).json({ success: false, message: "Tariff not found." });
        }

        return response.status(200).json(tariff);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function createTariff(request: Request, response: Response, next: NextFunction) {
    const tariffGroupId = request.params.id as string;
    const { contractId } = request.body;

    try {
        const existing = await prisma.tariff.findFirst({
            where: { tariffGroupId, contractId },
        });

        if (existing) {
            const groupProduct = await prisma.tariffGroupProduct.findFirst({
                where: { tariffGroupId },
            });
            const productId = groupProduct?.productId ?? "";
            await snapshotTariff(productId, contractId);
            await prisma.tariff.delete({ where: { id: existing.id } });
        }

        const tariff = await prisma.tariff.create({
            data: {
                tariffGroupId,
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

export const getTariffPrice = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    const { productId, contractId, duration, quantity, customerId } = request.query;

    if (!productId || !contractId || duration === undefined || quantity === undefined) {
        return response.status(400).json({
            success: false,
            message: "productId, contractId, duration und quantity sind erforderlich.",
        });
    }

    const durationNum = Number(duration);
    const quantityNum = Number(quantity);

    if (!Number.isInteger(durationNum) || !Number.isInteger(quantityNum)
        || durationNum <= 0 || quantityNum <= 0) {
        return response.status(400).json({
            success: false,
            message: "duration und quantity müssen positive Ganzzahlen sein.",
        });
    }

    try {
        const result = await calculatePrice({
            productId: productId as string,
            contractId: contractId as string,
            duration: durationNum,
            quantity: quantityNum,
            customerId: customerId as string | undefined,
        });

        if (!result.ok) {
            const statusByReason: Record<PriceFailureReason, number> = {
                NO_TARIFF: 404,
                NO_CELL: 404,
                NO_DEFAULT: 404,
                NO_COLUMN: 422,
                NO_ROW: 422,
                INVALID_INPUT: 400,
            };
            const status = statusByReason[result.reason];

            if (status === 400) {
                return response.status(400).json({
                    success: false,
                    reason: result.reason,
                    message: "duration und quantity müssen positive Ganzzahlen sein.",
                });
            }

            const messageByReason: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, string> = {
                NO_TARIFF: "Tariff für das Produkt/den Vertrag wurde nicht gefunden.",
                NO_CELL: "Keine Zelle für die gewählte Zeile/Spalte konfiguriert.",
                NO_DEFAULT: "Kein Default-Preis für die Zelle hinterlegt.",
                NO_COLUMN: "Laufzeit ist in keiner Tariff-Spalte konfiguriert.",
                NO_ROW: "Menge liegt außerhalb aller konfigurierten Mengenbereiche.",
            };

            return response.status(status).json({
                success: false,
                reason: result.reason,
                message: messageByReason[result.reason as Exclude<PriceFailureReason, 'INVALID_INPUT'>],
            });
        }

        return response.status(200).json({
            success: true,
            price: result.price,
            breakdown: result.breakdown,
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
};


export async function createTariffColumn(request: Request, response: Response, next: NextFunction) {
    const tariffId = request.params.tariffId as string;
    const duration = request.body.duration;

    try {
        const tariff = await prisma.tariff.findUniqueOrThrow({
            where: { id: tariffId },
            include: {
                rows: true,
                columns: { select: { order: true }, orderBy: { order: 'asc' } },
            }
        });

        const nextOrder = tariff.columns.length;

        const column = await prisma.$transaction(async (tx) => {
            const col = await tx.tariffColumn.create({
                data: { tariffId, duration, order: nextOrder },
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
            include: {
                columns: true,
                rows: { select: { order: true }, orderBy: { order: 'asc' } },
            }
        });

        const nextOrder = tariff.rows.length;

        const row = await prisma.$transaction(async (tx) => {
            const r = await tx.tariffRow.create({
                data: { tariffId, min_quantity, max_quantity, order: nextOrder },
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
        const groupProduct = await prisma.tariffGroupProduct.findUnique({
            where: { productId },
        });

        if (!groupProduct) return response.status(200).json([]);

        const tariff = await prisma.tariff.findUnique({
            where: { tariffGroupId_contractId: { tariffGroupId: groupProduct.tariffGroupId, contractId } },
            select: { columns: { select: { duration: true }, orderBy: { createdAt: 'asc' } } },
        });

        if (!tariff) return response.status(200).json([]);
        return response.status(200).json(tariff.columns.map(c => c.duration));
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}
