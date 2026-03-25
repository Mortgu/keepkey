import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";
import { calculateProductPrice } from "../utils/products.js";
import { ShoppingCart } from "@prisma/client";

const router = Router();

/* [POST] http://localhost:3000/api/cart */
router.post('/', requireSession, async (request: Request, response: Response) => {
    const { body } = request;
    const user = request.user;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        })
    }

    const match = await prisma.shoppingCart.findFirst({
        where: {
            AND: [
                { productId: body.productId },
                { userId: body.userId },
                { contractId: body.contractId },
                { duration: body.duration },
            ]
        },
    });


    if (match) {
        await prisma.shoppingCart.updateMany({
            where: {
                AND: [
                    { productId: body.productId },
                    { userId: body.userId },
                    { contractId: body.contractId },
                    { duration: body.duration },
                ]
            },
            data: {
                quantity: match.quantity + body.quantity,
            }
        });

        return response.status(200).json({
            message: "Updated item", success: true
        });
    }

    await prisma.shoppingCart.create({
        data: body
    });

    return response.status(200).json({
        message: "Successfully created item", success: true
    })
});

/* [GET] http://localhost:3000/api/cart */
router.get('/', requireSession, async (request: Request, response: Response) => {
    const user = request.user;

    // 1. Fetching the cart items with related data
    const items = await prisma.shoppingCart.findMany({
        where: { userId: user!.id },
        include: {
            contract: true,
            product: {
                include: {
                    productPricing: true,
                }
            },
        }
    });

    const merged = items.map(async (item) => {
        const price = calculateProductPrice(item.product, item.quantity, item.duration, item.contractId);

        return {
            ...item, price: price,
        }
    });

    return response.status(200).json(items);
})

/* [DELETE] http://localhost:3000/api/cart/{userId} */
router.delete('/:userId', requireSession, async (request: Request, response: Response) => {
    const { userId } = request.params;
    const sessionUser = request.user;

    await prisma.shoppingCart.deleteMany({
        where: { userId: userId as string },
    });

    return response.status(200).send({
        message: "Successfully deleted item", success: true
    })
})

export default router;
