import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAllCustomers = async (request: Request, response: Response) => {
    const customers = await prisma.customer.findMany({
        include: {
            contactPersons: true,
            address: true,
            orders: true,
        }
    });
    return response.status(200).json(customers);
}

export const getCustomerById = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            contactPersons: true,
            address: true,
            orders: true,
        }
    });

    if (!customer) {
        return response.status(404).json({ success: false, message: 'Customer not found!' });
    }

    return response.status(200).json(customer);
}

export const createCustomer = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(400).json({ success: false, message: 'Missing data!' });
    }

    try {
        const { contactPersons, ...customerFields } = body;

        const customer = await prisma.customer.create({
            data: { ...customerFields },
        });

        if (contactPersons?.length > 0) {
            await prisma.contactPerson.createMany({
                data: contactPersons.map((p: any) => ({
                    salutation: p.salutation,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    email: p.email,
                    customerId: customer.id,
                })),
            });
        }
    } catch (exception: any) {
        return response.status(500).json({
            success: false, message: 'Failed to create customer!', exception: exception.message
        });
    }

    return response.status(200).json({ success: true, message: 'Successfully created customer!' });
}

export const updateCustomerById = async (request: Request, response: Response) => {
    const id = request.params.id as string;
    const { body } = request;

    if (!body || !id) {
        return response.status(400).json({ success: false, message: 'Missing data!' });
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
            success: false, message: 'Failed to update customer!', exception: exception.message
        });
    }

    return response.status(200).json({ success: true, message: 'Successfully updated customer!' });
}

export const deleteCustomer = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    if (!id) {
        return response.status(400).json({ success: false, message: 'Missing customer id!' });
    }

    try {
        await prisma.customer.delete({ where: { id } });
    } catch (exception: any) {
        return response.status(500).json({
            success: false, message: 'Failed to delete customer!', exception: exception.message
        });
    }

    return response.status(200).json({ success: true, message: 'Successfully deleted customer!' });
}
