import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getOffers = async (request: Request, response: Response) => {
    const offers = await prisma.offer.findMany();
    return response.status(200).json(offers);
}

export const createOffer = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body || !body.offer) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    console.log(body);

    const createdOffer = await prisma.offer.create({ data: body.offer });
    return response.status(200).json(createdOffer);
}
