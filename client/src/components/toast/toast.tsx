import { toast as reactToast } from "react-toastify";
import i18n from "@/i18n";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ShowToastOptions {
    vars?: Record<string, unknown>;
    message?: string;
}

function resolveMessage(key: string, options?: ShowToastOptions): string {
    if (options?.message) return options.message;
    return i18n.t(key, options?.vars ?? {});
}

// eslint-disable-next-line react-refresh/only-export-components
export const showToast = {
    success: (key: string, options?: ShowToastOptions) =>
        reactToast.success(resolveMessage(key, options)),
    error: (key: string, options?: ShowToastOptions) =>
        reactToast.error(resolveMessage(key, options)),
    info: (key: string, options?: ShowToastOptions) =>
        reactToast.info(resolveMessage(key, options)),
    warning: (key: string, options?: ShowToastOptions) =>
        reactToast.warning(resolveMessage(key, options)),
} satisfies Record<ToastVariant, (key: string, options?: ShowToastOptions) => unknown>;

export { ToastContainer } from "react-toastify";
