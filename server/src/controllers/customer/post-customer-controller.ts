import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import logger from "../../middlewares/logger.js";

export const createCustomer = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({
            success: false,
            message: "Bad request! Missing body data.",
        });
    }

    const { contactPersons, ...customerFields } = body;

    try {
        const createdCustomer = await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.create({
                data: { ...body },
            });

            if (contactPersons?.length > 0) {
                await tx.contactPerson.createMany({
                    data: contactPersons.map((p: any) => ({
                        ...p,
                        customerId: customer.id,
                    })),
                });
            }

            return customer;
        });

        return response.status(200).json(createdCustomer);
    } catch (exception: any) {
        return response.status(500).json({
            success: false,
            message: "Failed to create customer!",
            exception: exception.message,
        });
    }
};

export const createCustomerContact = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id as string;
    const body = request.body;

    try {
        const createdContact = await prisma.contactPerson.create({
            data: { ...body }
        });

        return response.status(200).json(createdContact);
    } catch (exception: any) {
        logger.error(exception);
        next(exception);
    }
}
