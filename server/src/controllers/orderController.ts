import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/orders 
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