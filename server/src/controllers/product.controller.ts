import { Request, Response } from "express";

import * as productService from "../services/product.service.js";

/*
 * Get Workload
 * [GET] http://localhost:3000/api/products
 */
export const getProducts = async (request: Request, response: Response) => {
    const products = await productService.getProducts();
    return response.status(200).json(products);
}

/*
 * Get Workload
 * [GET] http://localhost:3000/api/products/:id
 */
export const getProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    const product = await productService.getProduct(productId);

    return response.status(200).json(product);
}

/*
 * Create Workload
 * [POST] http://localhost:3000/api/products
 */
export const createProduct = async (request: Request, response: Response) => {
    const result = await productService.createProduct(request.body);
    return response.status(200).json(result);
}

/*
 * Update Workload
 * [PATCH] http://localhost:3000/api/products/:id
 */
export const updateProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    const result = await productService.updateProduct(productId, request.body);

    return response.status(200).json(result);
}

/*
 * Delete Workload
 * [PATCH] http://localhost:3000/api/products/:id
 */
export const deleteProduct = async (request: Request, response: Response) => {
    const productId = request.params.id as string;
    await productService.deleteProduct(productId);

    return response.status(200).json({
        message: "Successfully deleted product!",
    });
}
