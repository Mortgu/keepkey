import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

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