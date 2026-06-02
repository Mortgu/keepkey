import {NextFunction, Request, Response} from 'express';
import {prisma, TaskStatus} from "../../lib/prismaClient.js";
import {taskQueue, taskQueueKey} from "../../workers/task-worker.js";
import {OfferFlatRate, OfferPosition, TaskTarget, TaskType} from "@prisma/client";
import {enqueueOfferGeneration} from "../../workers/jobs/index.js";
import {toDate} from '../../utils/utils.js';
import calculatePrice from "../../utils/products.js";

/*
 * Function to enqueue a new reservation job for an offer.
 * [POST] /api/offer/:id/reserve
 */

export const enqueueQuoteReservationJob = async (request: Request, response: Response, next: NextFunction) => {
    const {id} = request.params;

    try {
        const task = await enqueueOfferReservation(id as string);
        return response.status(200).json(task);
    } catch (exception: any) {
        return response.status(500).json({message: `Failed to enqueue reservation: ${exception.message}`});
    }
};

export const enqueueDocumentGenerationJob = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;

    const offer = await prisma.offer.findUnique({
        where: {id: offerId},
        include: {reservationTask: true},
    });

    if (!offer) {
        return response.status(404).json({message: "Offer not found"});
    }

    const reservationStatus = offer.reservationTask?.status;

    if (reservationStatus === TaskStatus.PENDING || reservationStatus === TaskStatus.RUNNING) {
        return response.status(409).json({message: "Reservation is already in progress"});
    }

    try {
        if (!offer.isReserved) {
            const task = await enqueueOfferReservation(offerId, {chainGenerationOnSuccess: true});
            return response.status(200).json({taskId: task!.id});
        }

        const task = await enqueueOfferGeneration(offerId);
        return response.status(200).json({taskId: task.id});
    } catch (exception: any) {
        return response.status(500).json({
            message: `Failed to start document generation: ${exception.message}`,
        });
    }
};

async function enqueueOfferReservation(offerId: string, opts: { chainGenerationOnSuccess?: boolean } = {}) {
    const offer = await prisma.offer.findUniqueOrThrow({
        where: {id: offerId},
        include: {reservationTask: true},
    });

    if (offer.isReserved) {
        return offer.reservationTask;
    }

    if (offer.reservationTask) {
        const job = await taskQueue.add(taskQueueKey, {taskId: offer.reservationTask.id, ...opts});
        await prisma.task.update({
            where: {id: offer.reservationTask.id},
            data: {status: TaskStatus.PENDING, jobId: job.id},
        });
        return offer.reservationTask;
    }

    const task = await prisma.task.create({
        data: {status: TaskStatus.PENDING, type: TaskType.RESERVATION, target: TaskTarget.OFFER},
    });
    const job = await taskQueue.add(taskQueueKey, {taskId: task.id, ...opts});
    await prisma.task.update({where: {id: task.id}, data: {jobId: job.id}});
    await prisma.offer.update({where: {id: offerId}, data: {reservationTaskId: task.id}});
    return task;
}

export const createOffer = async (request: Request, response: Response, next: NextFunction) => {
    const {body} = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request",
        });
    }

    const {offer, positions, flatRates} = body;

    if (!offer || !positions) {
        return response.status(400).json({
            message: "Bad request.",
        });
    }

    for (const position of positions) {
        position["total_cents"] = await calculatePrice({
            productId: position.productId,
            contractId: position.contractId,
            duration: position.duration_months,
            quantity: position.quantity,
            customerId: offer.customerId,
        });
    }

    try {
        request.body.offer = await prisma.$transaction(async (tx) => {
            let net_amount_positions = positions.reduce(
                (sum: number, p: OfferPosition) => sum + p.total_cents, 0);

            let net_amount_flatrates = flatRates.reduce(
                (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

            let net_amount = net_amount_positions + net_amount_flatrates;

            const {supplierId, validUntil, requestFrom, date, ...offerFields} = body.offer;
            const offer = await tx.offer.create({
                data: {
                    ...offerFields,
                    date: toDate(date) ?? new Date(),
                    supplierId: supplierId || null,
                    validUntil: toDate(validUntil),
                    requestFrom: toDate(requestFrom),
                    net_amount: net_amount,
                },
            });

            for (const position of positions) {
                const {
                    productId, contractId, duration_months,
                    quantity, optional, total_cents
                } = position;

                await tx.offerPosition.create({
                    data: {
                        offerId: offer.id,
                        productId,
                        contractId,
                        duration_months,
                        quantity,
                        total_cents,
                        optional,
                    },
                });
            }

            for (const flatRate of flatRates) {
                await tx.offerFlatRate.create({
                    data: {
                        offerId: offer.id,
                        flatRateId: flatRate.id,
                        quantity: flatRate.quantity,
                        total_cents: flatRate.total_cents,
                    },
                });
            }

            return offer;
        });

        return response.status(200).json(offer);
    } catch (exception: any) {
        return response.status(408).json({
            message: "Something went wrong trying to create offer: " + exception.message,
            success: false,
        });
    }
};
