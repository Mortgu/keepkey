import i18n from "@/i18n";
import { ApiError } from "@/lib/api-client";

const GENERIC_KEY = "common.errorGeneric";

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.code && i18n.exists(`errors.${error.code}`)) {
        return i18n.t(`errors.${error.code}`);
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return i18n.t(GENERIC_KEY);
}
