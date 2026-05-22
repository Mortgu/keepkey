import { Request, Response, NextFunction } from "express";
import { Prisma } from '@prisma/client';
import { map } from "zod";

export interface AppError extends Error {
  status?: number;
}

const prismaErrorMap: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: "Ein Eintrag mit diesen Werten existiert bereits." },
  P2003: { status: 409, message: "Daten können nicht gelöscht werden, da sie noch in Verwendung sind." },
  P2025: { status: 404, message: "Datensatz nicht gefunden." },
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

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

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
