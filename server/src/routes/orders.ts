import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";
import { getAllOrders, getSessionOrders } from "../controllers/orderController.js";
import { canViewOrders } from "../permissions/order.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get('/', requireSession, getSessionOrders);

/* [POST] http://localhost:3000/api/orders */
router.post('/', requireSession, async (request: Request, response: Response) => {
    const { body } = request;
    const user = request.user;

    if (!body || body.length === 0) {
        response.status(400).send({
            message: "Bad request", success: false
        })
    }

    if (!(body instanceof Array)) {
        return response.status(400).send({
            message: `Excepted Array got ${typeof body}`, success: false,
        });
    }

    console.log(body);

    const createdOrder = await prisma.$transaction(async (tx) => {
        /* Create Order */
        const order = await tx.order.create({
            data: { userId: user!.id }
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
                    priceAtPurchase: item.priceAtPurchase || 0,
                }
            });
        }

        /* Clear Shopping Card */
        await prisma.shoppingCart.deleteMany({
            where: { userId: user!.id }
        });

        return order;
    });

    console.log(createdOrder);

    response.status(200).send({});
});

router.delete('/:id', requireSession, async (request: Request, response: Response) => {
    const { id } = request.params;

    await prisma.order.delete({
        where: { id: id as string }
    });

    return response.status(200).send({
        message: 'Deletion successfully', success: true
    });
})

export default router;
