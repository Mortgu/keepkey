import type { en } from "@/i18n";
import i18n from "@/i18n";
import { ApiError } from "@/lib/api-client";

const GENERIC_KEY = "common.errorGeneric";

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.code) {
        // Der Code kommt zur Laufzeit vom Server, der Typ kann ihn nicht kennen.
        // Erst `exists` belegt, dass errors.json ihn führt — daher der Cast.
        const code = error.code as keyof typeof en.translation.errors;
        if (i18n.exists(`errors.${error.code}`)) return i18n.t(`errors.${code}`);
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return i18n.t(GENERIC_KEY);
}
