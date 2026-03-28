import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";

export const canViewAllUsers = async (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return response.status(404).json({
            success: false, message: 'Bad request! Missing user.',
        });
    }

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                users: ['view']
            }
        }
    });

    if (!success) {
        return response.status(400).send({
            success: false, message: "Permission not found",
        })
    }

    next();
}