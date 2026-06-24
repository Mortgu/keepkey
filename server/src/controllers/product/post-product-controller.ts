import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";


/* Create Product */
export const createProduct = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const {body} = request;

        if (!body) {
            return response.status(400).send({
                success: false,
                message: "Bad request",
            });
        }

        const {translations} = body;

        const newProduct = await prisma.product.create({
            data: {
                translations: {create: translations},
            },
            include: {translations: true},
        });

        return response.status(200).json(newProduct);
    } catch (error) {
        next(error);
    }
};