import { tv } from "tailwind-variants";
import { Link } from "@tanstack/react-router";

type Props = {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    hint?: string;
    to?: string;
    isLoading?: boolean;
};

const card = tv({
    base: "flex items-start gap-4 border border-(--border) rounded-md px-4 py-3.5 bg-white",
    variants: {
        interactive: {
            true: "transition-colors hover:bg-(--page-bg) cursor-pointer",
            false: "",
        },
    },
});

const iconBadge =
    "size-10 rounded-md flex items-center justify-center shrink-0 bg-(--primary-100) text-(--primary-600)";

function CardBody({ label, value, icon, hint, isLoading }: Omit<Props, "to">) {
    return (
        <>
            <div className={iconBadge}>{icon}</div>

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-xs font-medium text-(--text-secondary) uppercase tracking-wide">
                    {label}
                </span>
                {isLoading ? (
                    <span className="mt-1 h-6 w-20 rounded bg-(--page-bg) animate-pulse" />
                ) : (
                    <span className="text-xl font-semibold text-(--text) leading-tight">
                        {value}
                    </span>
                )}
                {hint && <p className="text-[11px] text-(--text-secondary)">{hint}</p>}
            </div>
        </>
    );
}

export function StatCard({ to, ...rest }: Props) {
    if (to) {
        return (
            <Link to={to} className={card({ interactive: true })}>
                <CardBody {...rest} />
            </Link>
        );
    }

    return (
        <div className={card({ interactive: false })}>
            <CardBody {...rest} />
        </div>
    );
}
