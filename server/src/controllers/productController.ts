import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.js";
import { prisma } from "../lib/prisma.js";

/* 
 * Get Products 
 * [GET] http://localhost:3000/api/products 
 */
export const getProducts = async (request: Request, response: Response, next: NextFunction) => {
    const result = await prisma.product.findMany({
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    });

    return response.status(200).json(result);
}

/* 
 * Get Product
 * [GET] http://localhost:3000/api/products/{id}
 */
export const getProduct = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    if (!id) {
        return response.status(400).json({
            success: false, message: 'Bad request',
        });
    }

    const product = await prisma.product.findUnique({
        where: { id: id as string }
    });

    return response.status(200).json(product);
}

/* Create Product */
export const createProduct = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { body } = request;

        if (!body) {
            return response.status(400).send({
                success: false, message: 'Bad request',
            });
        }

        const newProduct: Product = await prisma.product.create({
            data: { ...body }
        });

        return response.status(200).json(newProduct);
    } catch (error) {
        next(error);
    }
}

/* Update Product */
export const updateProduct = async (request: Request, response: Response, next: NextFunction) => {

}

/* 
 * Delete Product
 * [DELETE] http://localhost:3000/api/products/{id}
 */
export const deleteProduct = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    if (!id) {
        return response.status(400).json({
            success: false, message: 'Bad request',
        });
    }

    const result = await prisma.product.delete({
        where: { id: id as string },
    });

    return response.status(200).json(result);
}