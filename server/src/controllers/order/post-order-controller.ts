import {NextFunction, Request, Response} from "express";
import {prisma, TaskStatus, TaskTarget, TaskType} from "../../lib/prismaClient.js";
import {taskQueue, taskQueueKey} from "../../workers/task-queue.js";


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
        request.body.order = await prisma.$transaction(async (tx) => {
            const order = await prisma.order.create({
                data: {
                    supplierId: existingOffer.supplierId,
                    customerId: existingOffer.customerId,
                    contactPersonId: existingOffer.contactPersonId,
                    employeeId: existingOffer.userId,
                    offerId: existingOffer.id,

                    orderId: existingOffer.quoteId, // TODO: REMOVE THIS PLACEHOLDER
                    paymentTerm: existingOffer.paymentTerm,

                    date: new Date(),
                    validUntil: existingOffer.validUntil,
                    requestFrom: existingOffer.requestFrom,
                }
            });

            await prisma.orderPosition.createMany({
                data: existingOffer.offerPositions.map((offerPosition) => ({
                    orderId: order.id,
                    productId: offerPosition.productId,
                    contractId: offerPosition.contractId,
                    duration_months: offerPosition.duration_months,
                    quantity: offerPosition.quantity,
                    optional: offerPosition.optional,

                    total_cents: offerPosition.total_cents,
                }))
            });

            await prisma.orderFlatRate.createMany({
                data: existingOffer.offerFlatRates.map((offerFlatRate) => ({
                    flatRateId: offerFlatRate.flatRateId,
                    orderId: order.id,
                    quantity: offerFlatRate.quantity,
                    total_cents: offerFlatRate.total_cents,
                }))
            })

            return order;
        });
        next();
    } catch (exception: any) {
        return response.status(500).json({
            message: 'Something went wrong trying to create order from offer!',
        });
    }
}

const createDocumentForOrder = async (orderId: string) => {
    const task = await prisma.task.create({
        data: {
            target: TaskTarget.ORDER,
            type: TaskType.GENERATION,

            status: TaskStatus.PENDING,
        },
    });

    await prisma.$transaction(async (tx: any) => {
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

    const job = await taskQueue.add(taskQueueKey, {
        taskId: task.id,
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