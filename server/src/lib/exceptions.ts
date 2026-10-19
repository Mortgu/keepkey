export class AppException extends Error {

    statusCode: number;
    code: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Wirft, sobald `frozenAt` gesetzt ist — der wiederkehrende Fall "dieser
 * Vorgang ist eingefroren" (Angebot angenommen, Bestellung storniert, …), der
 * sonst an jeder prüfenden Stelle als eigenes `if (x) throw` stünde.
 */
export function assertNotFrozen(frozenAt: Date | null | undefined, code: string, message: string): void {
    if (frozenAt) {
        throw new AppException(message, 409, code);
    }
}