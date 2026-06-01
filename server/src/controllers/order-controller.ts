import {NextFunction, Request, Response} from "express";
import {prisma} from "../lib/prisma.js";
import {documentQueue, documentQueueKey} from "../lib/queues.js";
import {TaskStatus, TaskTarget, TaskType} from "@prisma/client";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders
 */
export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            documents: {
                orderBy: {createdAt: 'desc' as const},
                include: {task: true},
            },
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                },
            },
        },
    });

    return response.status(200).json(orders);
};

export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const {id} = request.body;

    const existingOffer = await prisma.offer.findUnique({
        where: {id: id as string},
        include: {
            offerPositions: true,
            offerFlatRates: true,
        }
    });

    if (!existingOffer) {
        return response.status(404).json({
            message: 'Offer not found!'
        });
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const order = await prisma.order.create({
                data: {
                    orderId: existingOffer.quoteId,
                    date: new Date(),
                    paymentTerm: existingOffer.paymentTerm,
                    projectId: '/', // TODO:

                    customerId: existingOffer.customerId,
                    supplierId: existingOffer.supplierId,
                    offerId: existingOffer.id,
                    contactPersonId: existingOffer.contactPersonId,
                    employeeId: existingOffer.userId,
                }
            });

            await prisma.orderPosition.createMany({
                data: existingOffer.offerPositions.map((offerPosition) => ({
                    orderId: order.id,
                    productId: offerPosition.productId,
                    contractId: offerPosition.contractId,
                    duration_months: offerPosition.duration_months,
                    quantity: offerPosition.quantity,

                    unit_price: 0,
                    discount: 0,
                    total: offerPosition.total_cents,
                }))
            });

            return order;
        });

        request.body.order = order;
        next();
    } catch (exception: any) {
        return response.status(500).json({
            message: 'Something went wrong trying to create order from offer!',
        });
    }
}

const createDocumentForOrder = async (orderId: string) => {
    const task = await prisma.task.create({
        data: {type: TaskType.ORDER, status: TaskStatus.PENDING},
    });

    await prisma.$transaction(async (tx) => {
        await tx.document.updateMany({
            where: {orderId, isCurrent: true},
            data: {isCurrent: false},
        });

        const latest = await tx.document.findFirst({
            where: {orderId},
            orderBy: {version: 'desc'},
            select: {version: true},
        });

        await tx.document.create({
            data: {
                orderId,
                taskId: task.id,
                version: (latest?.version ?? 0) + 1,
                status: "PENDING",
                isCurrent: true,
            },
        });
    });

    const job = await documentQueue.add(documentQueueKey, {
        taskId: task.id,
        taskTarget: TaskTarget.ORDER,
    });

    await prisma.task.update({
        where: {id: task.id},
        data: {jobId: job.id},
    });

    return task;
};

// Middleware — called after createOrder in the route chain
export const createOrderTask = async (request: Request, response: Response) => {
    const {order} = request.body;

    if (!order) {
        return response.status(404).json({
            message: "Failed to create order task. Missing order in body!",
        });
    }

    try {
        await createDocumentForOrder(order.id);
        return response.status(200).json(order);
    } catch (exception: any) {
        return response.status(500).json({
            message: `Failed to create task for order: ${order.id}`,
        });
    }
};

// Standalone endpoint — manually trigger document generation for an existing order
export const generateOrderDocument = async (request: Request, response: Response) => {
    const orderId = request.params.orderId as string;

    const order = await prisma.order.findUnique({
        where: {id: orderId},
        select: {id: true},
    });

    if (!order) {
        return response.status(404).json({message: "Order not found"});
    }

    try {
        const task = await createDocumentForOrder(orderId);
        return response.status(200).json({taskId: task.id});
    } catch (exception: any) {
        return response.status(500).json({
            message: `Failed to generate document for order: ${orderId}`,
        });
    }
};

/*
 * [GET] http://localhost:3000/api/orders/:orderId
 */
export const getOrderById = async (request: Request, response: Response) => {
    const {orderId} = request.params;

    const order = await prisma.order.findUnique({
        where: {id: orderId as string},
        include: {
            customer: true,
            documents: {
                orderBy: {createdAt: 'desc' as const},
                include: {task: true},
            },
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                },
            },
        },
    });

    return response.status(200).json(order);
};

export const deleteOrderById = async (request: Request, response: Response) => {
    const {id} = request.params;

    await prisma.order.delete({
        where: {id: id as string},
    });

    return response.status(200).send({
        message: "Deletion successfully",
        success: true,
    });
};
