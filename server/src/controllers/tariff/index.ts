import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import { calculatePrice, loadTariffForPricing, resolveCell, snapshotTariff, selectPrice, type PriceFailureReason } from "../../utils/products.js";
import { deleteCustomerPriceSchema, upsertCustomerPriceSchema } from "../../schemas/index.js";
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
        const result = await prisma.$transaction(async (tx) => {
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
    const { productId, contractId, duration, quantity, customerId, freeMonths } = request.query;

    if (!productId || !contractId || duration === undefined || quantity === undefined) {
        return response.status(400).json({
            success: false,
            message: "productId, contractId, duration und quantity sind erforderlich.",
        });
    }

    const durationNum = Number(duration);
    const quantityNum = Number(quantity);
    const freeMonthsNum = freeMonths === undefined ? 0 : Number(freeMonths);

    if (!Number.isInteger(durationNum) || !Number.isInteger(quantityNum)
        || durationNum <= 0 || quantityNum <= 0) {
        return response.status(400).json({
            success: false,
            message: "duration und quantity müssen positive Ganzzahlen sein.",
        });
    }

    if (!Number.isInteger(freeMonthsNum) || freeMonthsNum < 0 || freeMonthsNum > durationNum) {
        return response.status(400).json({
            success: false,
            message: "freeMonths muss eine Ganzzahl >= 0 und <= duration sein.",
        });
    }

    try {
        const result = await calculatePrice({
            productId: productId as string,
            contractId: contractId as string,
            duration: durationNum,
            quantity: quantityNum,
            customerId: customerId as string | undefined,
            freeMonths: freeMonthsNum,
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
    const { default_price, customer_price, customerId } = request.body;

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
            const updated = await prisma.tariffCellCustomer.upsert({
                where: { cellId_customerId: { cellId: cellId, customerId } },
                create: { cellId: cellId, customerId, price: customer_price },
                update: { price: customer_price },
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

const CUSTOMER_PRICE_STATUS: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, number> = {
    NO_TARIFF: 404,
    NO_CELL: 404,
    NO_DEFAULT: 404,
    NO_COLUMN: 422,
    NO_ROW: 422,
};

const CUSTOMER_PRICE_MESSAGE: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, string> = {
    NO_TARIFF: "Tariff für das Produkt/den Vertrag wurde nicht gefunden.",
    NO_CELL: "Keine Zelle für die gewählte Zeile/Spalte konfiguriert.",
    NO_DEFAULT: "Kein Default-Preis für die Zelle hinterlegt.",
    NO_COLUMN: "Laufzeit ist in keiner Tariff-Spalte konfiguriert.",
    NO_ROW: "Menge liegt außerhalb aller konfigurierten Mengenbereiche.",
};

export async function upsertCustomerPrice(request: Request, response: Response, next: NextFunction) {
    const parsed = upsertCustomerPriceSchema.safeParse(request.body);
    if (!parsed.success) {
        return response.status(400).json({
            success: false,
            message: parsed.error.issues.map(i => i.message).join(' & '),
        });
    }

    const { productId, contractId, duration, quantity, customerId, price } = parsed.data;

    try {
        const tariff = await loadTariffForPricing(productId, contractId);

        if (!tariff) {
            return response.status(404).json({
                success: false,
                reason: 'NO_TARIFF',
                message: CUSTOMER_PRICE_MESSAGE.NO_TARIFF,
            });
        }

        const resolved = resolveCell(tariff, { duration, quantity });
        if (!resolved.ok) {
            const status = CUSTOMER_PRICE_STATUS[resolved.reason];
            return response.status(status).json({
                success: false,
                reason: resolved.reason,
                message: CUSTOMER_PRICE_MESSAGE[resolved.reason],
            });
        }

        const cellId = resolved.cell.id;

        await prisma.tariffCellCustomer.upsert({
            where: { cellId_customerId: { cellId, customerId } },
            create: { cellId, customerId, price },
            update: { price },
        });

        const result = selectPrice(tariff, { duration, quantity, customerId });

        if (!result.ok) {
            return response.status(500).json({
                success: false,
                reason: result.reason,
                message: "Override gespeichert, aber Preis konnte nicht neu berechnet werden.",
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
}

export async function deleteCustomerPrice(request: Request, response: Response, next: NextFunction) {
    const parsed = deleteCustomerPriceSchema.safeParse(request.query);
    if (!parsed.success) {
        return response.status(400).json({
            success: false,
            message: parsed.error.issues.map(i => i.message).join(' & '),
        });
    }

    const { productId, contractId, duration, quantity, customerId } = parsed.data;

    try {
        const tariff = await loadTariffForPricing(productId, contractId);

        if (!tariff) {
            return response.status(404).json({
                success: false,
                reason: 'NO_TARIFF',
                message: CUSTOMER_PRICE_MESSAGE.NO_TARIFF,
            });
        }

        const resolved = resolveCell(tariff, { duration, quantity });
        if (!resolved.ok) {
            const status = CUSTOMER_PRICE_STATUS[resolved.reason];
            return response.status(status).json({
                success: false,
                reason: resolved.reason,
                message: CUSTOMER_PRICE_MESSAGE[resolved.reason],
            });
        }

        const cellId = resolved.cell.id;

        await prisma.tariffCellCustomer.deleteMany({
            where: { cellId, customerId },
        });

        const result = selectPrice(tariff, { duration, quantity, customerId });

        if (!result.ok) {
            return response.status(500).json({
                success: false,
                reason: result.reason,
                message: "Override gelöscht, aber Default-Preis konnte nicht berechnet werden.",
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
}
