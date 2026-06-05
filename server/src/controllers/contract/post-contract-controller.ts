import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const createContract = async (request: Request, response: Response) => {
    const {body} = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request",
            success: false,
        });
    }

    const {key, translations} = body;

    const createdContract = await prisma.contract.create({
        data: {
            key,
            translations: {create: translations},
        },
        include: {translations: true},
    });
    return response.status(200).json(createdContract);
};
