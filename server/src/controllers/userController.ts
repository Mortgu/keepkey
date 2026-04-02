import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAllUsers = async (request: Request, response: Response) => {
    const users = await prisma.user.findMany();
    return response.status(200).json(users);
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
        const address = await prisma.address.upsert({
            where: { userId },
            create: { userId, street, plz, city, phone },
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
        await prisma.contactPerson.createMany({
            data: persons.map(p => ({ ...p, userId })),
        });
        return response.status(201).json({ ok: true });
    } catch (error) {
        return response.status(500).json({ success: false, message: 'Failed to create contact persons' });
    }
}
