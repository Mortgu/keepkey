import type { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: string;
    amount?: string;
    date?: string;
    badge?: ReactNode;
};

export function RecentActivityRow({ title, subtitle, amount, date, badge }: Props) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-(--border) last:border-b-0">
            <div className="grid min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-(--text) truncate">{title}</span>
                    {subtitle && (
                        <span className="text-sm text-(--text-secondary) font-light shrink-0">
                            {subtitle}
                        </span>
                    )}
                </div>
                {date && (
                    <span className="text-[11px] text-(--text-secondary) font-light">
                        {date}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {badge}
                {amount && (
                    <span className="text-sm font-semibold text-(--text)">{amount}</span>
                )}
            </div>
        </div>
    );
}
