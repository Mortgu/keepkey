import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders
 */
export const getAllOrders = async (request: Request, response: Response, next: NextFunction) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
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
 * [GET] http://localhost:3000/api/orders/:orderId
 */
export const getOrderById = async (request: Request, response: Response, next: NextFunction) => {
    const { orderId } = request.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId as string },
        include: {
            customer: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    return response.status(200).json(order);
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

    const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
    if (!userRecord?.customerId) {
        return response.status(200).json([]);
    }

    const orders = await prisma.order.findMany({
        where: { customerId: userRecord.customerId },
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true,
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
 * Get document jobs for an order
 * [GET] http://localhost:3000/api/orders/:orderId/documents
 */
export const getOrderDocumentJobs = async (request: Request, response: Response) => {
    const { orderId } = request.params;

    const jobs = await prisma.documentJob.findMany({
        where: { orderId: orderId as string },
        orderBy: { createdAt: 'desc' },
    });

    return response.status(200).json(jobs);
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

    const userRecord = await prisma.user.findUnique({ where: { id: user!.id } });
    if (!userRecord?.customerId) {
        return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: { customerId: userRecord.customerId! },
        });

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

        return order;
    });

    if (!createdOrder) {
        return response.status(500).json({
            success: false, message: "Failed to create Order!",
        });
    }

    const documentJob = await prisma.documentJob.create({
        data: {
            orderId: createdOrder.id,
            type: 'invoice',
            status: 'pending',
        }
    });

    const job = await documentQueue.add(documentQueueKey, {
        documentJobId: documentJob.id, type: 'invoice'
    });

    await prisma.documentJob.update({
        where: { id: documentJob.id },
        data: { jobId: job.id }
    });

    return response.status(200).json(createdOrder);
}
