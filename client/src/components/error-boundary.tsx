import { AlertCircle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/button/button";

interface RouteErrorProps {
    error: unknown;
    onRetry?: () => void;
    retryLabel?: string;
}

export function RouteError({ error, onRetry, retryLabel }: RouteErrorProps) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const message =
        error instanceof Error
            ? error.message
            : typeof error === "string"
                ? error
                : t("common.errorGeneric");

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            queryClient.invalidateQueries();
        }
    };

    return (
        <div className="grid place-items-center gap-3 py-12 text-center">
            <AlertCircle className="size-8 text-(--destructive)" />
            <div className="grid gap-1">
                <p className="text-md font-medium text-(--text)">{t("common.errorTitle")}</p>
                <p className="text-sm text-(--text-secondary) max-w-md">{message}</p>
            </div>
            <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="size-3.5" />}
                onClick={handleRetry}
            >
                {retryLabel ?? t("common.errorRetry")}
            </Button>
        </div>
    );
}
