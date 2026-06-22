import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const getSuppliers = async (request: Request, response: Response) => {
    const suppliers = await prisma.supplier.findMany({
        include: {
            offers: true,
        }
    });
    return response.status(200).json(suppliers);
};

export const createSupplier = async (request: Request, response: Response) => {
    const {body} = request;

    if (!body) {
        return response.status(400).json({
            message: "Bad request",
            success: false,
        });
    }

    const createdSupplier = await prisma.supplier.create({data: body});
    return response.status(200).json(createdSupplier);
};

export const updateSupplier = async (request: Request, response: Response) => {
    const {body, params} = request;
    const {id} = params;

    if (!body || !id) {
        return response.status(400).json({
            message: "Bad request! Missing body or id!",
            success: false,
        });
    }

    const {supplierId, name} = body;

    try {
        const supplier = await prisma.supplier.updateMany({
            where: {id: id as string},
            data: {
                supplierId,
                name,
            },
        });

        return response.status(200).json(supplier);
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to update supplier!",
            exception,
        });
    }
};

export const deleteSupplier = async (request: Request, response: Response) => {
    const {id} = request.params;

    if (!id) {
        return response.status(400).json({
            message: "Bad request",
            success: false,
        });
    }

    const deletedSupplier = await prisma.supplier.deleteMany({
        where: {id: id as string},
    });

    return response.status(200).send(deletedSupplier);
};
