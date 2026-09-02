import { tv } from "tailwind-variants";
import { useTranslation } from "react-i18next";
import { RotateCcw, Settings } from "lucide-react";
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

const styles = tv({
    base: 'flex-1 grid rounded-lg bg-(--page-bg) border border-t-3 border-(--border)',
    variants: {
        status: {
            connected: "border-t-(--primary-400)",
            checking: "border-t-(--warning)",
            failed: "border-t-(--destructive)",
            not_configured: "border-t-gray-500",
        }
    }
});

const statusText = tv({
    base: "text-sm",
    variants: {
        status: {
            connected: "text-(--primary)",
            checking: "text-(--warning)",
            failed: "text-(--destructive)",
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

export default function IntegrationCard(props: Props) {
    const {
        name,
        status,
        meta,
        onRetry,
        onConfigure,
        isRetrying = false,
    } = props;

    const { t } = useTranslation();

    const showMeta = Boolean(meta && meta.length > 0);
    const retrying = isRetrying || status === "checking";

    return (
        <div className={styles({ status })}>
            <div className='flex items-center justify-between px-4 py-3'>
                <p className='text-lg font-medium'>{name}</p>
                <div className='flex items-center gap-4'>
                    <p className={statusText({ status })}>{t(STATUS_LABEL_KEYS[status])}</p>
                    {onRetry && (
                        <Button
                            size="xs"
                            variant="border"
                            icon={<RotateCcw />}
                            iconOnly

                            onClick={onRetry}
                            loading={retrying}
                        />
                    )}

                    {onConfigure && (
                        <Button
                            size="xs"
                            variant="border"
                            icon={<Settings />}
                            iconOnly

                            onClick={onConfigure}
                        />
                    )}
                </div>
            </div>

            {showMeta && (
                <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-lg border-t border-(--border)'>
                    {meta?.map((item) => (
                        <p key={item.label}>
                            <span className='text-gray-500'>{item.label}: </span>
                            {item.value}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
