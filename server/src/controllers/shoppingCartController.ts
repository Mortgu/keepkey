import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { calculateProductPrice } from "../utils/products.js";
import z from "zod";

/* This file handles all the actions for the "/api/shopping-cart" route */

/*
 * Get shopping cart from provided customerId
 * [GET] http://localhost:3000/api/shopping-cart/{customerId}
 */
export const getShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { customerId } = request.params;

    if (!customerId) {
        return response.status(400).json({
            success: false, message: 'Invalid customer id format!'
        });
    }

    const cart = await prisma.shoppingCart.findMany({
        where: { customerId: customerId as string },
        include: {
            contract: true,
            product: true
        }
    });

    return response.status(200).json(cart);
}

/*
 * Get shopping cart from session user
 * [GET] http://localhost:3000/api/shopping-cart
 */
export const getSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(400).json({
            success: false, message: 'Your are not authenticated!'
        });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) {
        return response.status(200).json({ products: [], total: 0 });
    }

    const products = await prisma.shoppingCart.findMany({
        where: { customerId: customer.id },
        include: {
            contract: true,
            product: true
        },
    });

    const total = await prisma.shoppingCart.aggregate({
        where: { customerId: customer.id },
        _sum: {
            price: true,
        }
    });

    return response.status(200).json({
        products: products,
        total: total._sum?.price || 0,
    });
}

const ShoppingCartSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.int().min(1).max(3),
    quantity: z.int().min(1),
});

/*
 * Create shopping cart for session user
 * [POST] http://localhost:3000/api/shopping-cart
 */
export const createSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { body, user } = request;

    if (!body || !user) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) {
        return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
    }

    const test = ShoppingCartSchema.parse(body);

    const entry = await prisma.shoppingCart.upsert({
        where: {
            customerId_productId_contractId_duration: {
                customerId: customer.id,
                productId: test.productId,
                contractId: test.contractId,
                duration: test.duration,
            }
        },
        update: {
            quantity: { increment: test.quantity },
        },
        create: {
            customerId: customer.id,
            productId: test.productId,
            contractId: test.contractId,
            duration: test.duration,
            quantity: test.quantity,
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
            customerId_productId_contractId_duration: {
                customerId: customer.id,
                productId: test.productId,
                contractId: test.contractId,
                duration: test.duration,
            }
        },
        data: {
            price: price.total,
        }
    });

    return response.status(200).json({
        message: "Successfully created item", success: true
    });
}

/*
 * Delete shopping cart for session user
 * [DELETE] http://localhost:3000/api/shopping-cart
 */
export const deleteSessionShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) {
        return response.status(200).send({ message: "Cart is empty", success: true });
    }

    await prisma.shoppingCart.deleteMany({
        where: { customerId: customer.id },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}

/*
 * Remove item from shopping cart for user
 * [PUT] http://localhost:3000/api/shopping-cart
 */
export const removeFromShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { user, body } = request;

    if (!user || !body || !body.id) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    await prisma.shoppingCart.deleteMany({
        where: { id: body.id },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}

/*
 * Delete shopping cart for provided customerId
 * [DELETE] http://localhost:3000/api/shopping-cart/{customerId}
 */
export const deleteShoppingCart = async (request: Request, response: Response, next: NextFunction) => {
    const { customerId } = request.params;

    if (!customerId) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    await prisma.shoppingCart.deleteMany({
        where: { customerId: customerId as string },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    });
}
