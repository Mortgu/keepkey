import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { User } from "@prisma/client";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
