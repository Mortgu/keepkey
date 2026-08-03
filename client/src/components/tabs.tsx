import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn, tv } from "tailwind-variants";

interface Props {
    tabs: Array<{
        value: string;
        label: ReactNode;
        count?: number;
        icon?: ReactNode;
    }>;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const tabStyles = tv({
    base: [
        "flex items-center gap-[7px] px-1 py-2.5",
        "font-sans text-[13.5px] font-medium cursor-pointer bg-transparent  border-b-2 border-transparent",
        "text-(--fg-3) hover:text-(--text-600) transition-colors duration-[140ms]",
    ],
    variants: {
        active: {
            true: 'text-(--primary-600) font-medium hover:text-(--text) border-b-2 border-(--primary-600)',
            false: ''
        }
    }
});

const underlineButton = tv({
    base: [
        "flex items-center gap-[7px] px-1 py-2.5",
        "font-sans text-[13.5px] font-medium cursor-pointer bg-transparent  border-b-2 border-transparent",
        "text-(--fg-3) hover:text-(--text-600) transition-colors duration-[140ms]",
    ],
    variants: {
        active: {
            true: "text-(--primary-600) font-medium hover:text-(--text) border-b-2 border-(--primary-600)",
            false: "",
        },
    },
});

export function Tabs({ tabs, value, onChange, className }: Props) {
    const refs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

    useLayoutEffect(() => {
        const el = refs.current[value];
        if (el) setRect({ left: el.offsetLeft, width: el.offsetWidth });
    }, [value, tabs]);


    return (
        <div
            role="tablist"
            className={cn("relative flex gap-4", className)}
        >
            {tabs.map((tab) => {
                const on = tab.value === value;
                return (
                    <button
                        key={tab.value}
                        ref={(el) => { refs.current[tab.value] = el; }}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => onChange(tab.value)}
                        className={underlineButton({ active: on })}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn("text-[11px] font-medium rounded-full px-1.5 py-px tabular-nums",
                                on ? "bg-(--primary-50) text-(--primary-600)" : "bg-(--subtle-50) text-(--fg-3)",
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}

        </div>
    );
}