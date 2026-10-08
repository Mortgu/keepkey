import { NextFunction, Request, Response } from "express";
import { Prisma } from '@prisma/client';

import env from "@/config/env.js";
import { AppException } from "@/lib/exceptions.js";
import logger from "@/utils/logger.js";

type errorMapProps = {
    status: number;
    code: string;
    message: string;
}

type ResolvedError = {
    status: number;
    body: Record<string, unknown> & { code: string; message: string };
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

/* body-parser-Fehler (kaputtes JSON, zu großer Body) — tragen `type` + `expose`. */
function isBodyParserError(error: any): error is { status: number; type: string; message: string } {
    return error instanceof Error
        && typeof (error as any).type === "string"
        && typeof (error as any).status === "number"
        && (error as any).expose === true;
}

function isWebDavError(error: any): error is { status: number; message: string } {
    return (
        error instanceof Error &&
        typeof (error as any).status === "number" &&
        /^[0-9]+$/.test(String((error as any).status))
    );
}

const isDev = env.NODE_ENV === "development";

function resolveError(error: any): ResolvedError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const mapped = prismaErrorMap[error.code];

        if (mapped) {
            return { status: mapped.status, body: { message: mapped.message, code: mapped.code } };
        }

        return {
            status: 400,
            body: {
                message: "Datenbankfehler",
                code: "PRISMA_UNKNOWN",
                ...(isDev && { detail: error.code }),
            },
        };
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return {
            status: 400,
            body: {
                message: isDev ? error.message : "Die übermittelten Daten entsprechen nicht den Validierungsregeln.",
                code: "PRISMA_VALIDATION_ERROR",
                ...(isDev && { stack: error.stack }),
            },
        };
    }

    if (error instanceof AppException) {
        return {
            status: error.statusCode,
            body: {
                message: error.message,
                code: error.code ?? "APP_ERROR",
                ...(isDev && { stack: error.stack }),
            },
        };
    }

    // Muss vor dem WebDAV-Check stehen: body-parser-Fehler haben ebenfalls ein
    // numerisches `status` und landeten sonst als 502 WEBDAV_ERROR beim Client.
    if (isBodyParserError(error)) {
        return {
            status: error.status,
            body: {
                message: error.status === 413 ? "Die Anfrage ist zu groß." : "Ungültiger Request-Body.",
                code: error.status === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST_BODY",
            },
        };
    }

    if (isWebDavError(error)) {
        const mapped = webDavErrorMap[error.status];

        if (mapped) {
            return { status: mapped.status, body: { message: mapped.message, code: mapped.code } };
        }

        return {
            status: 502,
            body: {
                message: "Fehler bei der Kommunikation mit dem Cloud-Speicher.",
                code: "WEBDAV_ERROR",
                ...(isDev && { detail: error.message }),
            },
        };
    }

    return {
        status: 500,
        body: {
            message: 'Something went wrong!',
            code: 'INTERNAL_SERVER_ERROR',
            ...(isDev && { stack: error?.stack }),
        },
    };
}

export const exceptionHandler = (error: any, request: Request, response: Response, next: NextFunction) => {
    const { status, body } = resolveError(error);

    const meta = {
        requestId: request.id,
        userId: request.user?.id,
        method: request.method,
        url: request.originalUrl,
        status,
        code: body.code,
    };

    // 5xx: voller Stack, das ist ein Bug oder ein Ausfall. 4xx: erwartbar,
    // die Originalmeldung reicht (sie kann vom gemappten Client-Text abweichen).
    if (status >= 500) {
        logger.error("request_failed", { ...meta, error });
    } else {
        logger.warn("request_failed", { ...meta, errorMessage: error?.message });
    }

    // Antwort läuft schon (z. B. Stream) — Express' Default-Handler bricht die Verbindung ab.
    if (response.headersSent) {
        return next(error);
    }

    return response.status(status).json({ ...body, requestId: request.id });
};
