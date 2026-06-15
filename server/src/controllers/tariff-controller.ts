import {NextFunction, Request, Response} from "express";
import {prisma} from "../lib/prismaClient.js";
import calculatePrice from "../utils/products.js";

const TARIFF_INCLUDE = {
    contract: {include: {translations: true}},
    rows: {
        orderBy: {order: "asc" as const},
        include: {cells: {orderBy: {order: "asc" as const}, include: {customerPrices: true}}},
    },
} as const;

export async function getAllTariffs(request: Request, response: Response) {
    const tariffs = await prisma.tariff.findMany({
        include: TARIFF_INCLUDE,
        orderBy: {
            id: "asc",
        },
    });
    return response.status(200).json(tariffs);
}

export async function getProductTariffs(request: Request, response: Response) {
    const productId = request.params.productId as string;

    const tariff = await prisma.tariff.findMany({
        where: {productId},
        include: TARIFF_INCLUDE,
    });

    return response.status(200).json(tariff);
}

export async function getTariff(request: Request, response: Response) {
    const id = request.params.tariffId as string;

    const tariff = await prisma.tariff.findUnique({
        where: {id},
        include: TARIFF_INCLUDE,
    });

    if (!tariff) {
        return response.status(404).json({success: false, message: "Tariff not found."});
    }

    return response.status(200).json(tariff);
}

export async function addTerm(request: Request, response: Response, next: NextFunction) {
    try {
        const tariffId = request.params.tariffId as string;
        const {duration} = request.body as { duration: number };

        const tariff = await prisma.tariff.findUnique({
            where: {
                id: tariffId
            },
            include: {
                rows: true
            }
        });

        if (!tariff) {
            return response.status(404).json({success: false, message: "Tariff not found."});
        }

        if (tariff.terms.includes(duration)) {
            return response.status(409).json({success: false, message: "Term already exists."});
        }

        await prisma.$transaction(async (tx) => {
            await tx.tariff.update({
                where: {id: tariffId},
                data: {terms: {push: duration}},
            });

            for (const row of tariff.rows) {
                const cellCount = await tx.tariffCell.count({
                    where: {rowId: row.id}
                });

                await tx.tariffCell.create({
                    data: {rowId: row.id, price: 0, order: cellCount},
                });
            }
        });

        const updated = await prisma.tariff.findUnique({where: {id: tariffId}, include: TARIFF_INCLUDE});
        return response.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function removeTerm(request: Request, response: Response, next: NextFunction) {
    try {
        const tariffId = request.params.tariffId as string;
        const {termIndex} = request.body as { termIndex: number };

        const tariff = await prisma.tariff.findUnique({
            where: {id: tariffId},
            include: {rows: {orderBy: {order: "asc"}, include: {cells: {orderBy: {order: "asc"}}}}}
        });
        if (!tariff) {
            return response.status(404).json({success: false, message: "Tariff not found."});
        }

        if (termIndex < 0 || termIndex >= tariff.terms.length) {
            return response.status(400).json({success: false, message: "Invalid term index."});
        }

        await prisma.$transaction(async (tx) => {
            const newTerms = tariff.terms.filter((_, i) => i !== termIndex);
            await tx.tariff.update({where: {id: tariffId}, data: {terms: {set: newTerms}}});

            for (const row of tariff.rows) {
                const cellToRemove = row.cells[termIndex];
                if (cellToRemove) {
                    await tx.tariffCell.delete({where: {id: cellToRemove.id}});
                    await tx.tariffCell.updateMany({
                        where: {rowId: row.id, order: {gt: cellToRemove.order}},
                        data: {order: {decrement: 1}},
                    });
                }
            }
        });

        const updated = await prisma.tariff.findUnique({where: {id: tariffId}, include: TARIFF_INCLUDE});
        return response.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function updateTerm(request: Request, response: Response, next: NextFunction) {
    try {
        const tariffId = request.params.tariffId as string;
        const {termIndex, duration} = request.body as { termIndex: number; duration: number };

        const tariff = await prisma.tariff.findUnique({where: {id: tariffId}});
        if (!tariff) {
            return response.status(404).json({success: false, message: "Tariff not found."});
        }

        if (termIndex < 0 || termIndex >= tariff.terms.length) {
            return response.status(400).json({success: false, message: "Invalid term index."});
        }

        if (tariff.terms.includes(duration) && tariff.terms[termIndex] !== duration) {
            return response.status(409).json({success: false, message: "Term already exists."});
        }

        const newTerms = [...tariff.terms];
        newTerms[termIndex] = duration;

        await prisma.tariff.update({
            where: {id: tariffId},
            data: {terms: {set: newTerms}},
        });

        const updated = await prisma.tariff.findUnique({where: {id: tariffId}, include: TARIFF_INCLUDE});
        return response.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function addBand(request: Request, response: Response, next: NextFunction) {
    try {
        const tariffId = request.params.tariffId as string;
        const {min_quantity, max_quantity, prices} = request.body as {
            min_quantity: number;
            max_quantity: number;
            prices: number[];
        };

        const tariff = await prisma.tariff.findUnique({where: {id: tariffId}});
        if (!tariff) {
            return response.status(404).json({success: false, message: "Tariff not found."});
        }

        await prisma.$transaction(async (tx) => {
            const rowCount = await tx.tariffRow.count({where: {tariffId}});
            const row = await tx.tariffRow.create({
                data: {tariffId, min_quantity, max_quantity, order: rowCount},
            });

            for (let i = 0; i < prices.length; i++) {
                await tx.tariffCell.create({
                    data: {rowId: row.id, price: prices[i], order: i},
                });
            }
        });

        const updated = await prisma.tariff.findUnique({where: {id: tariffId}, include: TARIFF_INCLUDE});
        return response.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function removeBand(request: Request, response: Response, next: NextFunction) {
    try {
        const rowId = request.params.rowId as string;

        const row = await prisma.tariffRow.findUnique({where: {id: rowId}});
        if (!row) {
            return response.status(404).json({success: false, message: "Row not found."});
        }

        await prisma.$transaction(async (tx) => {
            await tx.tariffRow.delete({where: {id: rowId}});
            await tx.tariffRow.updateMany({
                where: {tariffId: row.tariffId, order: {gt: row.order}},
                data: {order: {decrement: 1}},
            });
        });

        const updated = await prisma.tariff.findUnique({where: {id: row.tariffId}, include: TARIFF_INCLUDE});
        return response.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function updateCell(request: Request, response: Response, next: NextFunction) {
    try {
        const cellId = request.params.cellId as string;
        const {price} = request.body as { price: number };

        const cell = await prisma.tariffCell.update({
            where: {id: cellId},
            data: {price},
            include: {customerPrices: true},
        });

        return response.status(200).json(cell);
    } catch (error) {
        next(error);
    }
}

export const getTariffPrice = async (request: Request, response: Response) => {
    const {productId, contractId, duration, quantity, customerId} = request.query;

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
    return response.status(200).json(price);
};
