import { Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import { logger } from "better-auth";

export const deleteCustomer = async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
        await prisma.customer.delete({
            where: { id: id as string },
        });

        return response.status(200).json({
            message: "Successfully deleted customer!"
        });
    } catch (exception: any) {
        logger.error(exception.message);
        return response.status(500).json({
            message: 'Something went wrong trying to delete customer!', exception: exception.message,
        })
    }
};

export const deleteCustomerContact = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const contactId = request.params.contactId as string;

    try {
        await prisma.contactPerson.delete({
            where: { id: contactId },
        });

        return response.status(200).json({
            message: 'Successfully deleted customer contact.'
        });
    } catch (exception: any) {
        logger.error(exception);
        return response.status(500).json({
            message: 'Something went wrong trying to delete contact!'
        })
    }
}