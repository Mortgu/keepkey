import { Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";

export const updateCustomerById = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const { body } = request;

    if (!body || !id) {
        return response
            .status(400)
            .json({ success: false, message: "Missing data!" });
    }

    try {
        const { contactPersons, ...customerFields } = body;

        await prisma.customer.update({
            where: { id },
            data: { ...customerFields },
        });

        if (contactPersons !== undefined) {
            await prisma.contactPerson.deleteMany({ where: { customerId: id } });
            if (contactPersons.length > 0) {
                await prisma.contactPerson.createMany({
                    data: contactPersons.map((p: any) => ({
                        salutation: p.salutation,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        email: p.email,
                        customerId: id,
                    })),
                });
            }
        }
    } catch (exception: any) {
        return response.status(500).json({
            success: false,
            message: "Failed to update customer!",
            exception: exception.message,
        });
    }

    return response.status(200).json({
        message: "Successfully updated customer!"
    });
};


export const updateContact = async (request: Request, response: Response) => {
    const { cid } = request.params;
    const body = request.body;


    const contact = await prisma.contactPerson.update({
        where: { id: cid as string },
        data: {
            ...body
        }
    });

    if (!contact) {
        return response.status(404).json({
            message: 'Contact not found! Invalid id!'
        });
    }

    return response.status(200).json(contact);
}