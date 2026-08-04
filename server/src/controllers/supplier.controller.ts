import { Request, Response } from "express";

import * as supplierService from "../services/supplier.service.js";

/* ========== GET ========== */

export const getSuppliers = async (request: Request, response: Response) => {
    const suppliers = await supplierService.getSuppliers();
    return response.status(200).json(suppliers);
};

/* ========== POST ========== */

export const createSupplier = async (request: Request, response: Response) => {
    const supplier = await supplierService.createSupplier(request.body);
    return response.status(200).json(supplier);
};

/* ========== UPDATE ========== */

export const updateSupplier = async (request: Request, response: Response) => {
    const supplier = await supplierService.updateSupplier(
        request.params.id as string,
        request.body
    );
    return response.status(200).json(supplier);
};

/* ========== DELETE ========== */

export const deleteSupplier = async (request: Request, response: Response) => {
    await supplierService.deleteSupplier(request.params.id as string);
    return response.status(200).json({ success: true });
};
