import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import calculatePrice from "../utils/products.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";
import { OfferPosition } from "@prisma/client";

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

export const getOfferById = async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
        const offer = await prisma.offer.findFirstOrThrow({
            where: { id: id as string },
            include: {
                documentJobs: true
            }
        });

        return response.status(200).json(offer);
    } catch (exception: any) {
        return response.status(404).json({
            message: 'Offer not found!',
        });
    }
}

export const getOfferJobs = async (request: Request, response: Response) => {
    const { id } = request.params;
    const job = await prisma.documentJob.findFirst({
        where: { offerId: id as string, isCurrent: true }
    });

    return response.status(200).json(job ?? null);
}

export const getOfferJobById = async (request: Request, response: Response) => {
    const { id, jobId } = request.params;

    console.log(id, jobId)

    try {
        const documentJob = await prisma.documentJob.findFirstOrThrow({
            where: {
                AND: [
                    { id: jobId as string },
                    { offerId: id as string },
                ]
            }
        });

        return response.status(200).json(documentJob);
    } catch (exception: any) {
        return response.status(404).json({
            message: 'Job not found!',
        });
    }
}

export const createOfferDocumentJob = async (request: Request, response: Response) => {
    const { offer } = request.body;

    const documentJob = await prisma.$transaction(async (tx) => {
        await tx.documentJob.updateMany({
            where: { offerId: offer.id, isCurrent: true },
            data: { isCurrent: false }
        });

        return tx.documentJob.create({
            data: {
                offerId: offer.id,
                type: 'offer',
                status: 'pending',
                isCurrent: true
            }
        });
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

    const contracts = await prisma.contract.findMany();

    const includesOptionals = positions.some((p: OfferPosition) => p.optional);

    if (includesOptionals) {
        positions.push(...positions.flatMap((position: OfferPosition) =>
            contracts.filter(c => c.id !== position.contractId).map(contract => ({
                ...position,
                contractId: contract.id,
                isAlternative: true,
            }))
        ))
    }

    for (const position of positions) {
        const subtotal = await calculatePrice({
            ...position
        });

        if (subtotal) {
            position['total_cents'] = subtotal.total.value * position.duration_months;
        } else {
            position['total_cents'] = 0;
        }
    }

    try {
        request.body.offer = await prisma.$transaction(async (tx) => {
            let net_amount = positions.reduce((sum: number, p: OfferPosition) => sum + p.total_cents, 0);

            const offer = await tx.offer.create({
                data: {
                    ...body.offer,
                    net_amount: net_amount,
                    tax_rate: 19,
                    tax_amount: net_amount * 0.19,
                    total_amount: net_amount * 1.19,
                }
            });

            for (const position of positions) {
                const { productId, contractId, duration_months, quantity, optional, total_cents } = position;

                await tx.offerPosition.create({
                    data: {
                        offerId: offer.id,
                        productId,
                        contractId,
                        duration_months,
                        quantity,
                        total_cents,
                        optional,
                        tax_rate: 19,
                    }
                });
            }

            return offer;
        });
        next()
    } catch (exception: any) {
        return response.status(408).json({
            message: "Something went wrong trying to create offer: " + exception.message, success: false
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