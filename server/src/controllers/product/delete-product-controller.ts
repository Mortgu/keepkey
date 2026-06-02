import {NextFunction, Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";


/*
 * Delete Product
 * [DELETE] http://localhost:3000/api/products/{id}
 */
export const deleteProduct = async (request: Request, response: Response, next: NextFunction) => {
    const {id} = request.params;

    if (!id) {
        return response.status(400).json({
            success: false,
            message: "Bad request",
        });
    }

    const result = await prisma.product.deleteMany({
        where: {id: id as string},
    });

    return response.status(200).json(result);
};
