import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
    title: string;
    action?: { to: string; label: string };
    children: ReactNode;
};

export function DashboardSection({ title, action, children }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-(--text-secondary) uppercase tracking-wide">
                    {title}
                </h2>
                {action && (
                    <Link
                        to={action.to}
                        className="flex items-center gap-1 text-xs font-medium text-(--primary-600) hover:underline"
                    >
                        {action.label}
                        <ArrowRight className="size-3" />
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}
