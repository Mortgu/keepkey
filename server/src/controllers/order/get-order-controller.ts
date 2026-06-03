import { Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";


export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            orderDocuments: {
                orderBy: { version: "desc" as const },
                include: { document: true },
            },
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                },
            },
        },
    });

    return response.status(200).json(orders);
};

export const getOrderById = async (request: Request, response: Response) => {
    const { orderId } = request.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId as string },
        include: {
            customer: true,
            orderDocuments: {
                orderBy: { version: "desc" as const },
                include: { document: true },
            },
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                },
            },
        },
    });

    return response.status(200).json(order);
};
