import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";

export const getProducts = async (request: Request, response: Response, next: NextFunction) => {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            translations: true,
        },
    });

    return response.status(200).json(products);
};


/*
 * Get Product
 * [GET] http://localhost:3000/api/products/{id}
 */
export const getProduct = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id as string;

    if (!id) {
        return response.status(400).json({
            success: false,
            message: "Bad request",
        });
    }

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            translations: true,
        },
    });

    return response.status(200).json(product);
};