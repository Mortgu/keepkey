import type { Request, Response, NextFunction } from 'express';
import { auth } from "../lib/auth.js";

export async function canCreateProduct(request: Request, response: Response, next: NextFunction) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user!.id,
            permissions: {
                product: ["create"]
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
