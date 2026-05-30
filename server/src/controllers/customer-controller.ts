import {Request, Response} from "express";
import {prisma} from "../lib/prisma.js";
import logger from "../middlewares/logger.js";

export const getAllCustomers = async (request: Request, response: Response) => {
    const customers = await prisma.customer.findMany({
        include: {
            contactPersons: true,
            orders: true,
            offers: true,
        },
    });
    return response.status(200).json(customers);
};

export const getAllCustomerContacts = async (request: Request, response: Response) => {
    const {id} = request.params;

    const customer = await prisma.customer.findUnique({
        where: {id: id as string},
        include: {
            contactPersons: true
        }
    });

    if (!customer) {
        return response.status(404).json({
            message: 'Customer not found!'
        });
    }

    return response.status(200).json(customer.contactPersons);
}

export const getCustomerById = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    const customer = await prisma.customer.findUnique({
        where: {id},
        include: {
            contactPersons: true,
        },
    });

    if (!customer) {
        return response
            .status(404)
            .json({success: false, message: "Customer not found!"});
    }

    return response.status(200).json(customer);
};

export const createCustomer = async (request: Request, response: Response) => {
    const {body} = request;

    if (!body) {
        return response.status(400).json({
            success: false,
            message: "Bad request! Missing body data.",
        });
    }

    const {contactPersons, ...customerFields} = body;

    console.log(body);

    try {
        const createdCustomer = await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.create({
                data: {...body},
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

export const createContact = async (request: Request, response: Response) => {
    const body = request.body;

    const createdContact = await prisma.contactPerson.create({
        data: {...body}
    });

    return response.status(200).json(createdContact);
}

export const updateCustomerById = async (
    request: Request,
    response: Response,
) => {
    const id = request.params.id as string;
    const {body} = request;

    if (!body || !id) {
        return response
            .status(400)
            .json({success: false, message: "Missing data!"});
    }

    try {
        const {contactPersons, ...customerFields} = body;

        await prisma.customer.update({
            where: {id},
            data: {...customerFields},
        });

        if (contactPersons !== undefined) {
            await prisma.contactPerson.deleteMany({where: {customerId: id}});
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

export const deleteCustomer = async (request: Request, response: Response) => {
    const {id} = request.params;

    try {
        await prisma.customer.delete({
            where: {id: id as string},
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

export const updateContact = async (request: Request, response: Response) => {
    const {cid} = request.params;
    const body = request.body;

    console.log(body)

    const contact = await prisma.contactPerson.update({
        where: {id: cid as string},
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

export const deleteContactById = async (request: Request, response: Response) => {
    const {cid} = request.params;

    try {
        await prisma.contactPerson.delete({
            where: {id: cid as string}
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