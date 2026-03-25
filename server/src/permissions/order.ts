import type { Request, Response, NextFunction } from 'express';
import { auth } from "../lib/auth.js";

export async function canViewOrders(request: Request, response: Response, next: NextFunction) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user!.id,
            permissions: {
                orders: ["view"]
            },
        }
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "Can't view orders."
        });
    }

    next();
}
