import {Request, Response} from "express";

import {prisma} from "../../lib/prismaClient.js";

export const getAllUsers = async (request: Request, response: Response) => {
    const users = await prisma.user.findMany({
        include: {
            orders: true,
            customer: true,
            offers: true,
        },
    });

    return response.status(200).json(users);
};


export const getUserById = async (request: Request, response: Response) => {
    const {id} = request.params;

    const user = await prisma.user.findUnique({
        where: {id: id as string},
        include: {
            orders: true,
            customer: {
                include: {
                    contactPersons: true,
                },
            },
        },
    });

    return response.status(200).json(user);
};


export const getSessionUser = async (request: Request, response: Response) => {
    const user = request.user;

    if (!user) {
        return response.status(404).json({
            success: false,
            message: "No session found!",
        });
    }

    const databaseUser = await prisma.user.findUnique({
        where: {id: user.id as string},
    });

    return response.status(200).json(databaseUser);
};
