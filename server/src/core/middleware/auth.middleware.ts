import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "@prisma/client";

import { auth } from "../auth.js";
import { AppException } from "../exceptions.js";
import { getRequestContext } from "../request-context.js";
import logger from "../logger.js";

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
                code: "UNAUTHORIZED",
                message: "Not authorized",
                requestId: req.id,
            });
        }

        req.user = session.user as User;

        const context = getRequestContext();
        if (context) context.userId = req.user.id;

        return next();
    } catch (exception) {
        // Z. B. DB nicht erreichbar — sonst sähe das nur wie ein Logout aus.
        logger.error("session_lookup_failed", { error: exception });
        return res.status(401).send({
            success: false,
            code: "UNAUTHORIZED",
            message: "Not authorized",
            requestId: req.id,
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
