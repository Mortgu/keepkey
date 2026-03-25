import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { calculateProductPrice } from "../utils/products.js";
import z from "zod";

/* 
 * Get shopping cart from provided user
 * [GET] http://localhost:3000/api/cart/{userId}
 */
export const getShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { userId } = request.params;

    if (!userId) {
        return response.status(400).json({
            success: false, message: 'Invalid user id format!'
        });
    }

    const cart = await prisma.shoppingCart.findMany({
        where: { userId: userId as string },
        include: {
            contract: true,
            product: true
        }
    });

    return response.status(200).json(cart);
}

/* 
 * Get shopping cart from session user
 * [GET] http://localhost:3000/api/cart
 */
export const getSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(400).json({
            success: false, message: 'Your are not authenticated!'
        });
    }

    const cart = await prisma.shoppingCart.findMany({
        where: { userId: user.id as string },
        include: {
            contract: true,
            product: true
        }
    });

    return response.status(200).json(cart);
}

const ShoppingCartSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.int().min(1).max(3),
    quantity: z.int().min(1),
});

/* 
 * Create shopping cart for session user
 * [GET] http://localhost:3000/api/cart
 */
export const createSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { body, user } = request;

    if (!body || !user) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    const test = ShoppingCartSchema.parse(body);

    // TODO: make transaction

    const entry = await prisma.shoppingCart.upsert({
        where: {
            userId_productId_contractId: {
                userId: user.id, productId: test.productId, contractId: test.contractId,
            }
        },
        create: { ...body },
        update: {
            quantity: { increment: test.quantity },
        },
        include: {
            product: {
                include: {
                    productPricing: true
                }
            }
        }
    });

    const price = calculateProductPrice(entry.product, entry.quantity, test.duration, test.contractId);

    await prisma.shoppingCart.update({
        where: {
            userId_productId_contractId: {
                userId: user.id, productId: test.productId, contractId: test.contractId,
            }
        },
        data: {
            price: price.total,
        }
    })

    return response.status(200).json({
        message: "Successfully created item", success: true
    });
}

/* 
 * Delete shopping cart for session user
 * [DELETE] http://localhost:3000/api/cart
 */
export const deleteSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    await prisma.shoppingCart.deleteMany({
        where: { userId: user.id },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}


/* 
 * Remove item from shopping cart for session user
 * [UPDATE] http://localhost:3000/api/cart
 */
export const removeFromSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    await prisma.shoppingCart.deleteMany({
        where: { userId: user.id },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}

/* 
 * Delete shopping cart for provided userId
 * [DELETE] http://localhost:3000/api/cart/{userId}
 */
export const deleteShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { userId } = request.params;

    if (!userId) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    await prisma.shoppingCart.deleteMany({
        where: { userId: userId as string },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}