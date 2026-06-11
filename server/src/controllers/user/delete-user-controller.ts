import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const deleteUser = async (request: Request, response: Response) => {
    const {id} = request.params;

    if (!id) {
        return response.status(404).json({
            success: false,
            message: "Missing settings Id!",
        });
    }

    try {
        await prisma.user.delete({
            where: {id: id as string},
        });
    } catch (exception: any) {
        return response.status(500).json({
            success: false,
            message: "Something went wrong trying to delete settings!",
            exception: exception.message,
        });
    }

    return response.status(200).json({
        success: true,
        message: "Successfully deleted settings!",
    });
};

export const deleteAccount = async (request: Request, response: Response) => {
    const user = request.user;

    if (!user) {
        return response.status(404).json({
            success: false,
            message: "No session found!",
        });
    }

    await prisma.user.delete({
        where: {id: user.id},
    });

    return response.status(200).json({
        success: true,
        message: "Successfully deleted account!",
    });
};
