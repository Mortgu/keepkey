import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "@prisma/client";

import { auth } from "@/lib/auth.js";

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
