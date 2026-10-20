import type { ErrorCode } from "@/i18n";
import i18n from "@/i18n";
import { ApiError } from "@/lib/api-client";

const GENERIC_KEY = "common.errorGeneric";

type ErrorKey = `errors.${ErrorCode}`;

/** Der Code kommt zur Laufzeit vom Server — erst `exists` belegt, dass errors.json den Schlüssel führt. */
function isErrorKey(key: string): key is ErrorKey {
    return i18n.exists(key);
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.code) {
        const key = `errors.${error.code}`;
        if (isErrorKey(key)) return i18n.t(key);
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return i18n.t(GENERIC_KEY);
}
