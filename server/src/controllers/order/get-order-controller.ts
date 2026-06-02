import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";


/*
 * Get all orders
 * [GET] /api/admin/orders
 */

export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            documents: {
                orderBy: {createdAt: 'desc' as const},
                include: {task: true},
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

/*
 * [GET] http://localhost:3000/api/orders/:orderId
 */
export const getOrderById = async (request: Request, response: Response) => {
    const {orderId} = request.params;

    const order = await prisma.order.findUnique({
        where: {id: orderId as string},
        include: {
            customer: true,
            documents: {
                orderBy: {createdAt: 'desc' as const},
                include: {task: true},
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
