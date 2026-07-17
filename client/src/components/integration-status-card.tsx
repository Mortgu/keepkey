import { tv } from "tailwind-variants";
import { Loader, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components";

export type IntegrationStatus =
    | "connected"
    | "checking"
    | "failed"
    | "auth_expired"
    | "not_configured";

type Props = {
    name: string;
    icon: React.ReactNode;
    status: IntegrationStatus;
    detail?: string;
    meta?: string;
    onRetry?: () => void;
    onConfigure?: () => void;
    isRetrying?: boolean;
};

const card = tv({
    base: "w-fit flex items-center gap-4 border rounded-md px-4 py-3.5 bg-white",
    variants: {
        status: {
            connected: "border-(--border)",
            checking: "border-(--border)",
            failed: "border-red-200 bg-red-50",
            auth_expired: "border-(--border)",
            not_configured: "border-(--border)",
        },
    },
});

const logo = tv({
    base: "size-10 rounded-md flex items-center justify-center text-white shrink-0 rounded-full ",
    variants: {
        status: {
            connected: "bg-[#0082C9]",
            checking: "bg-[#0082C9]",
            failed: "bg-[#9DB0A6]",
            auth_expired: "bg-[#0082C9]",
            not_configured: "bg-[#C4CFC8]",
        },
    },
});

const pill = tv({
    base: "w-fit inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full",
    variants: {
        status: {
            connected: "bg-[#E6F2EC] text-[#00683F]",
            checking: "bg-[#E1F0FA] text-[#0F3D5E]",
            failed: "bg-[#FDECEA] text-[#7B1C12]",
            auth_expired: "bg-[#FEF3C7] text-[#7C3E0A]",
            not_configured: "bg-[#F0F4F1] text-[#4B5C52]",
        },
    },
});

const dot = tv({
    base: "size-1.5 rounded-full shrink-0",
    variants: {
        status: {
            connected: "bg-[#00683F]",
            checking: "bg-[#1D6FA4] animate-pulse",
            failed: "bg-[#C0392B]",
            auth_expired: "bg-[#B45309]",
            not_configured: "bg-[#8A9E93]",
        },
    },
});

const STATUS_LABELS: Record<IntegrationStatus, string> = {
    connected: "Connected",
    checking: "Checking connection…",
    failed: "Connection failed",
    auth_expired: "Auth expired",
    not_configured: "Not configured",
};

const iconBtn =
    "size-[30px] inline-flex items-center justify-center rounded-md border border-(--border) text-[#4B5C52] hover:bg-(--page-bg) hover:text-(--text-primary) active:bg-[#E0E4E1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export function IntegrationStatusCard({
    name,
    icon,
    status,
    detail,
    meta,
    onRetry,
    onConfigure,
    isRetrying = false,
}: Props) {
    return (
        <div className={card({ status })}>
            <div className={logo({ status })}>{icon}</div>

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="grid items-center gap-1">
                    <span className="text-md text-(--text-primary)">{name}</span>
                    <span className={pill({ status })}>
                        <span className={dot({ status })} />
                        {STATUS_LABELS[status]}
                    </span>
                </div>
                {detail && <p className="text-xs text-[#4B5C52] leading-snug">{detail}</p>}
                {meta && <p className="text-[11px] text-[#8A9E93]">{meta}</p>}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {status === "not_configured" && onConfigure && (
                    <Button size="sm" onClick={onConfigure} icon={<Plus className="size-3.5" />}>
                        Configure
                    </Button>
                )}

                {status === "failed" && onRetry && (
                    <Button size="sm" onClick={onRetry} loading={isRetrying} icon={<RefreshCw className="size-3.5" />}>
                        Retry
                    </Button>
                )}

                {status !== "not_configured" && status !== "failed" && onRetry && (
                    <button
                        className={iconBtn}
                        onClick={onRetry}
                        disabled={isRetrying || status === "checking"}
                        title="Retry connection"
                        aria-label="Retry connection"
                    >
                        {isRetrying || status === "checking" ? (
                            <Loader className="size-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="size-3.5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
