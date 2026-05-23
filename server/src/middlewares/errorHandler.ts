import { Request, Response, NextFunction } from "express";
import { Prisma } from '@prisma/client';
import { AppException } from "../exceptions/exceptions.js";
import logger from "./logger.js";
import env from "../lib/env.js";

const prismaErrorMap: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "Ein Eintrag mit diesen Werten existiert bereits." },
  P2003: { status: 409, message: "Daten können nicht gelöscht werden, da sie noch in Verwendung sind." },
  P2025: { status: 404, message: "Datensatz nicht gefunden." },
}

export const errorHandler = (err: AppException, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  if (!isOperational) {
    logger.error("UNHANDLED ERROR: ", err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = prismaErrorMap[err.code];

    if (mapped) {
      return res.status(mapped.status).json({
        message: mapped.message, code: err.code
      });
    }

    return res.status(400).json({
      message: "Datenbankfehler", code: err.code,
    });
  }

  res.status(statusCode).json({
    status: 'error',
    code: err.code ?? 'INTERNAL_ERROR',
    message: isOperational ? err.message : 'Something went wrong!',
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
