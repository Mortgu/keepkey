import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";

const router = Router();

/* [POST] http://localhost:3000/api/cart */
router.post('/', requireSession, async (request, response) => {
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
                { productId: body.id },
                { userId: user.id }
            ]
        },
    });


    if (match) {
        await prisma.shoppingCart.updateMany({
            where: {
                AND: [
                    { productId: body.id },
                    { userId: user.id }
                ]
            },
            data: {
                quantity: match.quantity + 1,
            }
        });

        return response.status(200).json({
            message: "Updated item", success: true
        });
    }

    await prisma.shoppingCart.create({
        data: {
            userId: user.id,
            productId: body.id,
            quantity: 1,
        }
    });

    return response.status(200).json({
        message: "Successfully created item", success: true
    })
});

/* [GET] http://localhost:3000/api/cart */
router.get('/', requireSession, async (request, response) => {
    const user = request.user;
    const items = await prisma.shoppingCart.findMany({
        where: {
            userId: user.id
        },
        include: {
            product: {
                include: {
                    productPricing: true
                }
            },
        }
    });

    return response.status(200).send(items);
})

export default router;