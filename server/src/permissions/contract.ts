import type { Request, Response, NextFunction } from 'express';
import { auth } from "../lib/auth.js";

export async function canCreateContract(request: Request, response: Response, next: NextFunction) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user!.id,
            permissions: {
                contracts: ["create"]
            },
        }
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "Can't create contract."
        });
    }

    next();
}

export async function canDeleteContract(request: Request, response: Response, next: NextFunction) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user!.id,
            permissions: {
                contracts: ["delete"]
            },
        }
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "Can't delete contract."
        });
    }

    next();
}
