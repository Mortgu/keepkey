import type {Request, Response} from "express";

import * as service from "../services/supplier.service.js";

/* ========== GET ========== */

export const getSuppliers = async (request: Request, response: Response) => {
    const suppliers = await service.getSuppliers(request.query);
    return response.status(200).json(suppliers);
};

/* ========== POST ========== */

export const createSupplier = async (request: Request, response: Response) => {
    const supplier = await service.createSupplier(request.body);
    return response.status(200).json(supplier);
};

/* ========== UPDATE ========== */

export const updateSupplier = async (request: Request, response: Response) => {
    const supplier = await service.updateSupplier(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(supplier);
};

/* ========== DELETE ========== */

export const deleteSupplier = async (request: Request, response: Response) => {
    await service.deleteSupplier(request.params.id as string);
    return response.status(200).json({success: true});
};
