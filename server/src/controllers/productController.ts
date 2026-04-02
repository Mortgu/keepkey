import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.js";
import { prisma } from "../lib/prisma.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

/* 
 * Get all products for admin
 * [GET] http://localhost:3000/api/admin/products 
 */
export const getAllProducts = async (request: Request, response: Response, next: NextFunction) => {
    const prodcuts = await prisma.product.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    });

    return response.status(200).json(prodcuts);
}


/* 
 * Get Session/Published Products 
 * [GET] http://localhost:3000/api/products 
 */
export const getProducts = async (request: Request, response: Response, next: NextFunction) => {
    const products = await prisma.product.findMany({
        where: { published: true },
        orderBy: { createdAt: 'asc' },
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    });

    return response.status(200).json(products);
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

/* 
 * Update Product
 * [PUT] http://localhost:3000/api/products/{id}
 */
export const updateProduct = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const body = request.body;

    if (!id || !body) {
        return response.status(400).json({
            success: false, message: 'Bad request',
        });
    }

    const result = await prisma.product.updateMany({
        where: { id: id as string },
        data: { ...body },
    });

    return response.status(200).json(result);
}