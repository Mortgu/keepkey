import { toast as reactToast } from "react-toastify";
import type {TranslationKey} from "@/i18n";
import i18n from "@/i18n";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ShowToastOptions {
    vars?: Record<string, unknown>;
    message?: string;
}

type ShowToast = (key: TranslationKey, options?: ShowToastOptions) => unknown;

function resolveMessage(key: TranslationKey, options?: ShowToastOptions): string {
    if (options?.message) return options.message;
    return i18n.t(key, options?.vars ?? {});
}

// eslint-disable-next-line react-refresh/only-export-components
export const showToast = {
    success: (key, options?) => reactToast.success(resolveMessage(key, options)),
    error: (key, options?) => reactToast.error(resolveMessage(key, options)),
    info: (key, options?) => reactToast.info(resolveMessage(key, options)),
    warning: (key, options?) => reactToast.warning(resolveMessage(key, options)),
} satisfies Record<ToastVariant, ShowToast>;

export { ToastContainer } from "react-toastify";
