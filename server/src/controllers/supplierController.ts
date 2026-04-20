import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getSuppliers = async (request: Request, response: Response) => {
    const suppliers = await prisma.supplier.findMany();
    return response.status(200).json(suppliers);
}

export const createSupplier = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const createdSupplier = await prisma.supplier.create({ data: body });
    return response.status(200).json(createdSupplier);
}

export const deleteSupplier = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body || !body.id) {
        return response.status(400).json({
            message: "Bad request", success: false
        });
    }

    const deletedSupplier = await prisma.supplier.deleteMany({
        where: { id: body.id }
    });

    return response.status(200).send(deletedSupplier);
}