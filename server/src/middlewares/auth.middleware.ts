import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "@prisma/client";

import { auth } from "@/lib/auth.js";
import { AppException } from "@/lib/exceptions.js";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export async function requireSession(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).send({
                success: false,
                message: "Not authorized",
            });
        }

        req.user = session.user as User;
        return next();
    } catch (exception) {
        return res.status(401).send({
            success: false,
            message: "Not authorized",
        });
    }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
    const roles = (req.user?.role ?? "").split(",").map((role) => role.trim());

    if (!roles.includes("admin")) {
        return next(new AppException("Admin privileges required!", 403, "FORBIDDEN_ADMIN_ONLY"));
    }

    return next();
}
