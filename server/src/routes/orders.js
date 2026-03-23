import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get('/', async (request, response) => {
    const result = await prisma.order.findMany({
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
    response.status(200).send(result);
});

// TODO Permission Check
/* [POST] http://localhost:3000/api/orders */
router.post('/', requireSession, async (request, response) => {
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
        const order = await tx.order.create({
            data: { userId: user.id }
        });

        for (const item of body) {
            await tx.orderPosition.create({
                data: { orderId: order.id, ...item }
            })
        }

        return order;
    });

    console.log(createdOrder);

    response.status(200).send({});
});

export default router;