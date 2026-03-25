import type { Request, Response, NextFunction } from 'express';
import { auth } from "../lib/auth.js";

export const canViewProducts = async (request: Request, response: Response, next: NextFunction) => {
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
                products: ["view"]
            }
        },
    });

    if (!success) {
        return response.status(400).send({
            success: false, message: "Permission not found",
        })
    }

    next();
}

export async function canCreateProduct(request: Request, response: Response, next: NextFunction) {
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
                products: ["create"]
            }
        },
    });

    if (!success) {
        return response.status(400).send({
            success: false, message: "Permission not found",
        })
    }

    next();
}

export async function canDeleteProduct(request: Request, response: Response, next: NextFunction) {
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
                products: ['delete'],
            },
        },
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "You are not allowed to delete a product!",
        });
    }

    next();
}

export const canUpdateProduct = async (request: Request, response: Response, next: NextFunction) => {
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
                products: ['update'],
            },
        },
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "You are not allowed to delete a product!",
        });
    }

    next();
}