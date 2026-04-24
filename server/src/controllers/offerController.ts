import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import calculatePrice from "../utils/products.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";
import { Offer, OfferPosition } from "@prisma/client";

export const getOffers = async (request: Request, response: Response) => {
    const offers = await prisma.offer.findMany({
        include: {
            customer: true,
            supplier: true,
            customerContactPerson: true,
            offerPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });
    return response.status(200).json(offers);
}

export const createOfferDocumentJob = async (request: Request, response: Response) => {
    const { offer } = request.body;

    const documentJob = await prisma.documentJob.create({
        data: {
            offerId: offer.id,
            type: 'offer',
            status: 'pending'
        }
    });

    const job = await documentQueue.add(documentQueueKey, {
        documentJobId: documentJob.id, type: 'offer'
    });

    await prisma.documentJob.update({
        where: { id: documentJob.id },
        data: { jobId: job.id }
    });

    return response.status(200).json(offer)
}

export const createOffer = async (request: Request, response: Response, next: NextFunction) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const { offer, positions } = body;

    if (!offer || !positions) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    console.log(offer, positions);

    try {
        const createdOffer = await prisma.$transaction(async (tx) => {
            let total_cent = 0;

            for (const position of positions) {
                const { productId, contractId, duration, quantity } = position;
                const subtotal = await calculatePrice({ productId, contractId, duration, quantity });

                if (!subtotal) {
                    throw new Error("An items subtotal is null");
                }

                total_cent = total_cent + subtotal.total.value * position.duration * 12;
            }

            const offer = await tx.offer.create({
                data: {
                    ...body.offer,
                    net_amount: total_cent,
                    tax_rate: 19,
                    tax_amount: total_cent * 0.19,
                    total_amount: total_cent * 1.19,
                }
            });

            for (const position of positions) {
                const { productId, contractId, duration, quantity } = position;
                const subtotal = await calculatePrice({ productId, contractId, duration, quantity });

                await tx.offerPosition.create({
                    data: {
                        offerId: offer.id,
                        ...position,
                        price_at_purchase: subtotal!.total.value,
                        tax_rate_at_purchase: 19.00,
                    }
                });
            }

            return offer;
        });

        request.body.offer = createdOffer;
        next()
    } catch (exception: any) {
        return response.status(408).json({
            message: "Somthing went wrong trying to create offer: " + exception.message, success: false
        });
    }
}

export const deleteOffer = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const { id } = body;

    if (!id) {
        return response.status(400).json({
            message: "Bad request. Missing id!", success: false
        });
    }

    try {
        await prisma.offer.deleteMany({
            where: { id: id },
        });

        return response.status(200).json({
            success: true, message: 'Successfully deleted offer!'
        });
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to delete offer!", success: false
        });
    }
}