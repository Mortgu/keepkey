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
