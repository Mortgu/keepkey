import { tv } from "tailwind-variants";
import { RotateCcw, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";

export type IntegrationStatus =
    | "connected"
    | "checking"
    | "failed"
    | "not_configured";

export type IntegrationCardMeta = { label: string; value: string };

type Props = {
    name: string;
    status: IntegrationStatus;
    meta?: Array<IntegrationCardMeta>;
    onRetry?: () => void;
    onConfigure?: () => void;
    isRetrying?: boolean;
};

const statusText = tv({
    base: "text-md font-light",
    variants: {
        status: {
            connected: "text-green-800",
            checking: "text-blue-700",
            failed: "text-red-700",
            not_configured: "text-gray-500",
        },
    },
});

const STATUS_LABEL_KEYS: Record<IntegrationStatus, string> = {
    connected: "dashboard.status.connected",
    checking: "dashboard.status.checking",
    failed: "dashboard.status.failed",
    not_configured: "dashboard.status.notConfigured",
};

export default function IntegrationCard({
    name,
    status,
    meta,
    onRetry,
    onConfigure,
    isRetrying = false,
}: Props) {
    const { t } = useTranslation();

    const showMeta = Boolean(meta && meta.length > 0);
    const retrying = isRetrying || status === "checking";

    return (
        <div className="grid">
            <div className="w-full flex items-start justify-between px-4 pt-4 pb-2">
                <div className="w-fit flex items-center justify-center gap-2">
                    <div className="grid">
                        <p className="text-lg">{name}</p>
                        <p className={statusText({ status })}>
                            {t(STATUS_LABEL_KEYS[status])}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onRetry && (
                        <Button
                            variant="secondary"
                            size="xs"
                            icon={<RotateCcw size={14} />}
                            iconOnly
                            onClick={onRetry}
                            loading={retrying}
                        />
                    )}
                    {onConfigure && (
                        <Button
                            variant="secondary"
                            size="xs"
                            icon={<Settings size={14} />}
                            iconOnly
                            onClick={onConfigure}
                        />
                    )}
                </div>
            </div>

            {showMeta && (
                <div className="flex gap-x-4 flex-wrap items-start px-4 pb-4 font-light ">
                    {meta!.map((item) => (
                        <p
                            key={item.label}
                            className="flex gap-1  min-w-fit text-sm text-gray-500"
                        >
                            <span className="text-gray-400">{item.label}:</span>{" "}
                            {item.value}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
