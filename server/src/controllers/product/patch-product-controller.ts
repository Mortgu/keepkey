import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

/*
 * Update Product
 * [PUT] http://localhost:3000/api/products/{id}
 */
export const updateProduct = async (request: Request, response: Response, next: NextFunction) => {
    const {id} = request.params;
    const body = request.body;

    if (!id || !body) {
        return response.status(400).json({
            success: false,
            message: "Bad request",
        });
    }

    const result = await prisma.product.updateMany({
        where: {id: id as string},
        data: {...body},
    });

    return response.status(200).json(result);
};
