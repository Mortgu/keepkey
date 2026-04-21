import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

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

export const createOffer = async (request: Request, response: Response) => {
    const { body } = request;

    console.log(body);

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
                await tx.offerPosition.create({
                    data: {
                        offerId: offer.id,
                        ...position
                    }
                });
            }

            return offer;
        })

        return response.status(200).json(createdOffer);
    } catch (exception: any) {
        return response.status(500).json({
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