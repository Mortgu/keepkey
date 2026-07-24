import { NextFunction, Request, Response } from "express";
import { Prisma } from '@prisma/client';

import env from "@/lib/env.js";
import { AppException } from "@/lib/exceptions.js";
import logger from "@/utils/logger.js";

type errorMapProps = {
    status: number;
    code: string;
    message: string;
}

const prismaErrorMap: Record<string, errorMapProps> = {
    P2002: { status: 409, code: "PRISMA_UNIQUE_CONSTRAINT", message: "Ein Eintrag mit diesen Werten existiert bereits." },
    P2003: { status: 409, code: "PRISMA_FOREIGN_KEY", message: "Dieser Datensatz kann nicht gelöscht werden, da er noch verwendet wird." },
    P2025: { status: 404, code: "PRISMA_NOT_FOUND", message: "Datensatz nicht gefunden." },
}

const webDavErrorMap: Record<number, errorMapProps> = {
    401: { status: 401, code: "WEBDAV_UNAUTHORIZED", message: "Falscher Benutzername oder Passwort!" },
    403: { status: 403, code: "WEBDAV_FORBIDDEN", message: "Keine Rechte, um in diesen Ordner zu schreiben!" },
    404: { status: 404, code: "WEBDAV_NOT_FOUND", message: "Datei oder Verzeichnis nicht gefunden." },
    405: { status: 405, code: "WEBDAV_METHOD_NOT_ALLOWED", message: "Die WebDAV-Aktion wird vom Server nicht unterstützt." },
    507: { status: 507, code: "WEBDAV_INSUFFICIENT_STORAGE", message: "Der Cloud-Speicher/Server ist voll." },
}

function isWebDavError(error: any): error is { status: number; message: string } {
    return (
        error instanceof Error &&
        typeof (error as any).status === "number" &&
        /^[0-9]+$/.test(String((error as any).status))
    );
}

export const exceptionHandler = (error: any, request: Request, response: Response, next: NextFunction) => {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mapped = prismaErrorMap[error.code];

        if (mapped) {
            return response.status(mapped.status).json({
                message: mapped.message,
                code: mapped.code,
            });
        }

        return response.status(400).json({
            message: "Datenbankfehler",
            code: "PRISMA_UNKNOWN",
            ...(env.NODE_ENV === "development" && { detail: error.code }),
        });
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        const clientMessage = env.NODE_ENV === "development"
            ? error.message
            : "Die übermittelten Daten entsprechen nicht den Validierungsregeln.";

        return response.status(400).json({
            message: clientMessage,
            code: "PRISMA_VALIDATION_ERROR",
            ...(env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }

    if (isWebDavError(error)) {
        const mapped = webDavErrorMap[error.status];

        if (mapped) {
            return response.status(mapped.status).json({
                message: mapped.message,
                code: mapped.code,
            });
        }

        return response.status(502).json({
            message: "Fehler bei der Kommunikation mit dem Cloud-Speicher.",
            code: "WEBDAV_ERROR",
            ...(env.NODE_ENV === "development" && { detail: error.message }),
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
