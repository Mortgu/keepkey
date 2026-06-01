import {NextFunction, Request, Response} from "express";
import {Prisma} from '@prisma/client';
import {AppException} from "../exceptions/exceptions.js";
import logger from "./logger.js";
import env from "../lib/env.js";

type errorMapProps = {
    status: number;
    message: string;
}

const prismaErrorMap: Record<string, errorMapProps> = {
    P2002: {status: 409, message: "Ein Eintrag mit diesen Werten existiert bereits."},
    P2003: {status: 409, message: "Daten können nicht gelöscht werden, da sie noch in Verwendung sind."},
    P2025: {status: 404, message: "Datensatz nicht gefunden."},
}

const webDavErrorMap: Record<string, errorMapProps> = {
    401: {status: 401, message: "Falscher Benutzername oder Passwort!"},
    403: {status: 403, message: "Keine Rechte, um in diesen Ordner zu schreiben!"},
    404: {status: 404, message: "Datei oder Verzeichnis nicht gefunden."},
    405: {status: 405, message: "Die WebDAV-Aktion wird vom Server nicht unterstützt."},
    507: {status: 507, message: "Der Cloud-Speicher/Server ist voll."}
}

export const errorHandler = (err: AppException, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode ?? 500;
    const isOperational = err.isOperational ?? false;

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


    if (!isOperational) {
        logger.error("UNHANDLED ERROR: ", err);
    }

    res.status(statusCode).json({
        message: isOperational ? err.message : 'Something went wrong!',
        code: err.code ?? 'INTERNAL_ERROR',

        ...(env.NODE_ENV === "development" && {stack: err.stack}),
    });
};
