import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { dmmfToRuntimeDataModel } from "@prisma/client/runtime/client";
import { auth } from "../lib/auth.js";

export const getAllUsers = async (request: Request, response: Response) => {
    const users = await prisma.user.findMany({
        include: {
            employeeOrders: true,
            customer: true,
            offers: true,
        }
    });
    return response.status(200).json(users);
}

export const getUserById = async (request: Request, response: Response) => {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
        where: { id: id as string },
        include: {
            employeeOrders: true,
            customer: {
                include: {
                    contactPersons: true,
                    address: true,
                }
            }
        }
    });

    return response.status(200).json(user);
}

export const updateUserById = async (request: Request, response: Response) => {
    const { body, params } = request;
    const { id } = params;

    if (!body || !id) {
        return response.status(404).json({
            success: false, message: 'Missing data!'
        });
    }

    try {
        const { contactPersons, ...userFields } = body;

        await prisma.user.update({
            where: { id: id as string },
            data: { ...userFields },
        });

    } catch (exception: any) {
        return response.status(500).json({
            success: false, message: 'Something went wrong trying to update user!'
        });
    }

    return response.status(200).json({
        success: true, message: 'Successfully updated user!'
    });
}

export const createUser = async (request: Request, response: Response) => {
    const { body } = request;

    if (!body) {
        return response.status(404).json({
            success: false, message: 'Missing data!'
        });
    }

    try {

        const createdUser = await auth.api.createUser({
            body: {
                email: body.email,
                password: '',
                name: `${body.firstName} ${body.lastName}`,
                role: 'user',
                data: { ...body },
            },
        });

        return response.status(200).json(createdUser);
    } catch (exception: any) {
        return response.status(500).json({
            success: false, message: 'Something went wrong trying to create user!', exception: exception.message
        });
    }

    return response.status(200).json({
        success: true, message: 'Successfully created user!'
    });
}

export const deleteUser = async (request: Request, response: Response) => {
    const { id } = request.params;

    if (!id) {
        return response.status(404).json({
            success: false, message: 'Missing user Id!'
        });
    }

    try {
        await prisma.user.delete({
            where: { id: id as string }
        })
    } catch (exception: any) {
        return response.status(500).json({
            success: false, message: 'Something went wrong trying to delete user!', exception: exception.message
        });
    }

    return response.status(200).json({
        success: true, message: 'Successfully deleted user!'
    });
}

export const getSessionUser = async (request: Request, response: Response) => {
    const user = request.user;

    if (!user) {
        return response.status(404).json({
            success: false, message: 'No session found!'
        });
    }

    const databaseUser = await prisma.user.findMany({
        where: { id: user!.id },
    });

    return response.status(200).json(databaseUser);
}

export const deleteAccount = async (request: Request, response: Response) => {
    const user = request.user;

    if (!user) {
        return response.status(404).json({
            success: false, message: 'No session found!'
        });
    }

    await prisma.user.delete({
        where: { id: user.id },
    });

    return response.status(200).json({
        success: true, message: 'Successfully deleted account!',
    });
}

export const upsertAddress = async (request: Request, response: Response) => {
    const { street, plz, city, phone } = request.body;
    const userId = request.user?.id;

    if (!userId) {
        return response.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const customer = await prisma.customer.findUnique({ where: { userId } });
        if (!customer) {
            return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
        }

        const address = await prisma.address.upsert({
            where: { customerId: customer.id },
            create: { customerId: customer.id, street, plz, city, phone },
            update: { street, plz, city, phone },
        });
        return response.status(200).json(address);
    } catch (error) {
        return response.status(500).json({ success: false, message: 'Failed to save address' });
    }
}

export const createContactPersons = async (request: Request, response: Response) => {
    const persons: Array<{ salutation: string; firstName: string; lastName: string; email?: string }> = request.body;
    const userId = request.user?.id;

    if (!userId) {
        return response.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const customer = await prisma.customer.findUnique({ where: { userId } });
        if (!customer) {
            return response.status(400).json({ success: false, message: 'No customer linked to this account!' });
        }

        await prisma.contactPerson.createMany({
            data: persons.map(p => ({ ...p, customerId: customer.id })),
        });
        return response.status(201).json({ ok: true });
    } catch (error) {
        return response.status(500).json({ success: false, message: 'Failed to create contact persons' });
    }
}
