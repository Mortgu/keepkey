import {Request, Response} from "express";
import calculatePrice from "../utils/products.js";

const tariffInclude = {
    products: true,
    configs: {include: {contract: true}},
    customers: {include: {product: true, contract: true, customer: true}},
} as const;

export const getAllTariffs = async (_request: Request, response: Response) => {
    const tariffs = await prisma.tariff.findMany({include: tariffInclude});
    return response.status(200).json(tariffs);
};

export const getTariffById = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const tariff = await prisma.tariff.findUnique({
        where: {id},
        include: tariffInclude,
    });
    if (!tariff) {
        return response.status(404).json({message: "Tariff not found"});
    }
    return response.status(200).json(tariff);
};

export const createTariff = async (request: Request, response: Response) => {
    const {productIds = []} = request.body ?? {};

    try {
        const tariff = await prisma.$transaction(async (tx) => {
            const conflicting = await tx.product.findMany({
                where: {id: {in: productIds}, tariffId: {not: null}},
                select: {id: true, name: true, tariffId: true},
            });
            if (conflicting.length > 0) {
                throw new Error(
                    `Products already belong to another tariff: ${conflicting
                        .map((p) => p.name)
                        .join(", ")}`,
                );
            }

            const created = await tx.tariff.create({
                data: {
                    products: {connect: productIds.map((id: string) => ({id}))},
                },
                include: tariffInclude,
            });
            return created;
        });

        return response.status(201).json(tariff);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not create tariff: " + exception.message,
        });
    }
};

export const updateTariff = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const {productIds = []} = request.body ?? {};

    try {
        const tariff = await prisma.$transaction(async (tx) => {
            const conflicting = await tx.product.findMany({
                where: {
                    id: {in: productIds},
                    tariffId: {not: null, notIn: [id]},
                },
                select: {id: true, name: true},
            });
            if (conflicting.length > 0) {
                throw new Error(
                    `Products already belong to another tariff: ${conflicting
                        .map((p) => p.name)
                        .join(", ")}`,
                );
            }

            await tx.product.updateMany({
                where: {tariffId: id, id: {notIn: productIds}},
                data: {tariffId: null},
            });
            await tx.product.updateMany({
                where: {id: {in: productIds}},
                data: {tariffId: id},
            });

            return tx.tariff.findUnique({where: {id}, include: tariffInclude});
        });

        return response.status(200).json(tariff);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not update tariff: " + exception.message,
        });
    }
};

export const deleteTariff = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    try {
        await prisma.tariff.delete({where: {id}});
        return response.status(200).json({success: true});
    } catch (exception: any) {
        return response.status(500).json({
            message: "Could not delete tariff: " + exception.message,
        });
    }
};

export const addTariffConfig = async (request: Request, response: Response) => {
    const tariffId = request.params.id as string;
    const {contractId, duration, min_quantity, max_quantity, price} = request.body;

    try {
        const entry = await prisma.tariffConfig.create({
            data: {
                tariffId,
                contractId,
                duration,
                min_quantity,
                max_quantity: max_quantity ?? null,
                price,
            },
        });
        return response.status(200).json(entry);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not add tariff config: " + exception.message,
        });
    }
};

export const updateTariffConfig = async (request: Request, response: Response) => {
    const configId = request.params.configId as string;
    try {
        const entry = await prisma.tariffConfig.update({
            where: {id: configId},
            data: request.body,
        });
        return response.status(200).json(entry);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not update tariff config: " + exception.message,
        });
    }
};

export const deleteTariffConfig = async (request: Request, response: Response) => {
    const configId = request.params.configId as string;
    try {
        await prisma.tariffConfig.delete({where: {id: configId}});
        return response.status(200).json({success: true});
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not delete tariff config: " + exception.message,
        });
    }
};

export const addTariffCustomer = async (request: Request, response: Response) => {
    const tariffId = request.params.id as string;
    const {
        productId,
        contractId,
        customerId,
        duration,
        min_quantity,
        max_quantity,
        price,
    } = request.body;

    try {
        const entry = await prisma.tariffCustomer.create({
            data: {
                tariffId,
                productId,
                contractId,
                customerId,
                duration,
                min_quantity,
                max_quantity: max_quantity ?? null,
                price,
            },
        });
        return response.status(201).json(entry);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not add customer override: " + exception.message,
        });
    }
};

export const updateTariffCustomer = async (request: Request, response: Response) => {
    const tariffCustomerId = request.params.tariffCustomerId as string;
    try {
        const entry = await prisma.tariffCustomer.update({
            where: {id: tariffCustomerId},
            data: request.body,
        });
        return response.status(200).json(entry);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not update customer override: " + exception.message,
        });
    }
};

export const deleteTariffCustomer = async (request: Request, response: Response) => {
    const tariffCustomerId = request.params.tariffCustomerId as string;
    try {
        await prisma.tariffCustomer.delete({where: {id: tariffCustomerId}});
        return response.status(200).json({success: true});
    } catch (exception: any) {
        return response.status(400).json({
            message: "Could not delete customer override: " + exception.message,
        });
    }
};

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
