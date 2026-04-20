import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";
import { getOrderById, getSessionOrders } from "../controllers/orderController.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get('/', requireSession, getSessionOrders);

router.get('/:orderId', getOrderById);

/* DEPRECATED: [POST] http://localhost:3000/api/orders */
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

    const customer = await prisma.customer.findUnique({ where: { userId: user!.id } });
    if (!customer) {
        return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
        /* Create Order */
        const order = await tx.order.create({
            data: { customerId: customer.id }
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
            where: { customerId: customer.id }
        });

        return order;
    });

    // Dispatch document generation jobs
    const jobTypes = ['invoice', 'license'];
    for (const type of jobTypes) {
        const docJob = await prisma.documentJob.create({
            data: {
                orderId: createdOrder.id,
                type,
                status: 'pending',
            },
        });

        const bullJob = await documentQueue.add(documentQueueKey, {
            documentJobId: docJob.id, type, orderId: createdOrder.id,
        });

        // BullMQ Job-ID zurückschreiben
        await prisma.documentJob.update({
            where: { id: docJob.id },
            data: { jobId: bullJob.id },
        });
    }

    response.status(200).send({
        orderId: createdOrder.id,
        success: true,
    });
});

/* [GET] http://localhost:3000/api/orders/:id/documents */
router.get('/:id/documents', requireSession, async (request: Request, response: Response) => {
    const { id } = request.params;

    const documentJobs = await prisma.documentJob.findMany({
        where: { orderId: id as string },
        orderBy: { createdAt: 'asc' },
    });

    return response.status(200).send(documentJobs);
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
