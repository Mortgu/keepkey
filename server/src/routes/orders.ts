import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireSession } from "../middlewares/auth.js";
import { getOrderById, getSessionOrders, getOrderDocumentJobs } from "../controllers/orderController.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get('/', requireSession, getSessionOrders);

router.get('/:orderId', getOrderById);

router.get('/:orderId/documents', requireSession, getOrderDocumentJobs);

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
