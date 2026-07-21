import { NextFunction, Request, Response } from "express";
import { Prisma } from '@prisma/client';

import env from "@/lib/env.js";
import { AppException } from "@/lib/exceptions.js";
import logger from "@/utils/logger.js";

type errorMapProps = {
    status: number;
    message: string;
}

const prismaErrorMap: Record<string, errorMapProps> = {
    P2002: { status: 409, message: "Ein Eintrag mit diesen Werten existiert bereits." },
    P2003: { status: 409, message: "Daten können nicht gelöscht werden, da sie noch in Verwendung sind." },
    P2025: { status: 404, message: "Datensatz nicht gefunden." },
}

const webDavErrorMap: Record<string, errorMapProps> = {
    401: { status: 401, message: "Falscher Benutzername oder Passwort!" },
    403: { status: 403, message: "Keine Rechte, um in diesen Ordner zu schreiben!" },
    404: { status: 404, message: "Datei oder Verzeichnis nicht gefunden." },
    405: { status: 405, message: "Die WebDAV-Aktion wird vom Server nicht unterstützt." },
    507: { status: 507, message: "Der Cloud-Speicher/Server ist voll." }
}

export const exceptionHandler = (error: any, request: Request, response: Response, next: NextFunction) => {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mapped = prismaErrorMap[error.code];

        if (mapped) {
            return response.status(mapped.status).json({
                message: mapped.message, code: error.code
            });
        }

        return response.status(400).json({
            message: "Datenbankfehler", code: error.code,
        });
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        const clientMessage = env.NODE_ENV === "development"
            ? error.message
            : "Die breitgestellten Daten entsprechen nicht den Validierungsregeln der Datenbank.";

        return response.status(400).json({
            message: clientMessage,
            code: "PRISMA_VALIDATION_ERROR",
            ...(env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }

    if (error instanceof AppException) {
        if (!error.isOperational) {
            logger.error("UNHANDLED_OPERATIONAL_ERROR: ", error);
        }

        return response.status(error.statusCode).json({
            message: error.message,
            code: error.code ?? "APP_ERROR",
            ...(env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }

    logger.error("UNKNOWN_CRITICAL_ERROR: ", error);

    return response.status(500).json({
        message: 'Something went wrong!',
        code: 'INTERNAL_SERVER_ERROR',
        ...(env.NODE_ENV === "development" && { stack: error.stack }),
    });
};