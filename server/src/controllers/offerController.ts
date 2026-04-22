import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { calculatePrice } from "../utils/products.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

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

    if (!body.offer || !body.positions) {
        return response.status(400).json({
            message: "Bad request.", success: false
        });
    }

    try {
        const createdOffer = await prisma.$transaction(async (tx) => {
            const offer = await tx.offer.create({
                data: body.offer
            });

            for (const position of body.positions) {
                const pricing = await prisma.productPricing.findMany({
                    where: {
                        AND: [
                            { productId: position.productId },
                            { contractId: position.contractId },
                            { duration: position.duration },
                        ]
                    },
                    select: {
                        min_quantity: true,
                        max_quantity: true,
                        price: true
                    }
                });

                if (pricing.length === 0) {
                    throw new Error(`No pricing found for product!`);
                }

                const { totalPrice, priceBreakdown } = calculatePrice(pricing, position.quantity);

                await tx.offerPosition.create({
                    data: {
                        ...position,
                        offerId: offer.id,
                        totalPrice,
                        priceBreakdown,
                    }
                });
            }

            return offer;
        })

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