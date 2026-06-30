import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import logger from "../../middlewares/logger.js";

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

export async function getTariffGroups(_request: Request, response: Response) {
    const groups = await prisma.tariffGroup.findMany({
        include: TARIFF_GROUP_INCLUDE,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return response.status(200).json(groups);
}

export async function getTariffGroup(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id as string;

    try {
        const group = await prisma.tariffGroup.findUnique({
            where: { id },
            include: TARIFF_GROUP_INCLUDE,
        });

        if (!group) {
            return response.status(404).json({ success: false, message: "TariffGroup not found." });
        }

        return response.status(200).json(group);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function createTariffGroup(request: Request, response: Response, next: NextFunction) {
    const { products } = request.body as { products: string[] };

    try {
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

        const result = await prisma.tariffGroup.findUniqueOrThrow({
            where: { id: group.id },
            include: TARIFF_GROUP_INCLUDE,
        });

        return response.status(201).json(result);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function updateTariffGroup(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id as string;
    const { products } = request.body as { products?: string[] };

    try {
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

        const updated = await prisma.tariffGroup.findUniqueOrThrow({
            where: { id },
            include: TARIFF_GROUP_INCLUDE,
        });

        return response.status(200).json(updated);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}

export async function deleteTariffGroup(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id as string;

    try {
        await prisma.tariffGroup.delete({
            where: { id },
        });

        return response.status(200).json({
            success: true,
            message: "TariffGroup deleted.",
        });
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}
