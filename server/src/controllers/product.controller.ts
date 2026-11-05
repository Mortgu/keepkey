import type {Request, Response} from "express";
import {productListSchema, productSchema, workloadFilterSchema} from "@keepit/schemas";

import * as service from "../services/product.service.js";

/*
 * Get Workload
 * [GET] http://localhost:3000/api/products
 */
export const getProducts = async (request: Request, response: Response) => {
    const filters = workloadFilterSchema.parse(request.query);
    const products = await service.getProducts(filters);
    return response.status(200).json(productListSchema.parse(products));
}

/*
 * Get Workload
 * [GET] http://localhost:3000/api/products/:id
 */
export const getProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    const product = await service.getProduct(productId);

    return response.status(200).json(productSchema.parse(product));
}

/*
 * Create Workload
 * [POST] http://localhost:3000/api/products
 */
export const createProduct = async (request: Request, response: Response) => {
    const result = await service.createProduct(request.body);
    return response.status(200).json(result);
}

/*
 * Update Workload
 * [PATCH] http://localhost:3000/api/products/:id
 */
export const updateProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    const result = await service.updateProduct(productId, request.body);

    return response.status(200).json(result);
}

/*
 * Delete Workload
 * [PATCH] http://localhost:3000/api/products/:id
 */
export const deleteProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    await service.deleteProduct(productId);

    return response.status(200).json({
        message: "Successfully deleted product!",
    });
}
