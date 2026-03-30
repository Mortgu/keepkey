import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateInvoicePDF } from "../utils/document-generator.js";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders 
 */
export const getAllOrders = async (request: Request, response: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    return response.status(200).json(orders);
}

/*
 * Get all session orders
 * [GET] http://localhost:3000/api/orders 
 */
export const getSessionOrders = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(403).json({
            success: false, message: 'Bad request',
        });
    }

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
            user: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    return response.status(200).json(orders);
}

/*
 * Create new order
 * [POST] http://localhost:3000/api/orders 
 */
export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const { body, user } = request;

    if (!body || !user || body.length === 0) {
        response.status(400).send({
            message: "Bad request", success: false
        });
    }

    if (!(body instanceof Array)) {
        return response.status(400).send({
            message: `Excepted Array got ${typeof body}`, success: false,
        });
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
        /* Create Order */
        const order = await tx.order.create({
            data: { userId: user!.id },
        });

        /* Create Order Positions */
        for (const item of body) {
            await tx.orderPosition.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    contractId: item.contractId,
                    duration: item.duration,
                    quantity: item.quantity,
                    priceAtPurchase: item.price || 0,
                }
            });
        }

        /* Clear Shopping Card */
        await prisma.shoppingCart.deleteMany({
            where: { userId: user!.id }
        });

        return order;
    });

    /* Return if failed */
    if (!createdOrder) {
        return response.status(500).json({
            success: false, message: "Failed to create Order!",
        });
    }

    /* Order successfull => Generate Documents */

}