import { useLayoutEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import type { TabItem, TabsCommonProps } from "./tabs-types";
import { cn } from "@/lib/utils";

/* ── Underline tabs — sliding indicator ─────────────────────────────── */

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

export function UnderlineTabs({ tabs, value, onChange, className }: TabsCommonProps) {
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
                            <span
                                className={cn(
                                    "text-[11px] font-medium rounded-full px-1.5 py-px tabular-nums",
                                    on
                                        ? "bg-(--primary-50) text-(--primary-600)"
                                        : "bg-(--subtle-50) text-(--fg-3)",
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}

        </div>
    );
}

/* ── Icon tabs — page sub-navigation ────────────────────────────────── */

const iconButton = tv({
    base: [
        "flex items-center gap-[7px] px-3.5 py-2.5 -mb-px border-b-2",
        "font-sans text-[13px] font-medium cursor-pointer bg-transparent border-x-0 border-t-0",
        "border-transparent text-(--fg-3) hover:text-(--text-600) transition-colors duration-[140ms]",
    ],
    variants: {
        active: {
            true: "border-(--primary-600) text-(--primary-600) font-semibold hover:text-(--primary-600)",
            false: "",
        },
    },
});

export function IconTabs({ tabs, value, onChange, className }: TabsCommonProps) {
    return (
        <div
            role="tablist"
            className={cn("flex gap-0.5 border-b border-(--border)", className)}
        >
            {tabs.map((tab) => {
                const on = tab.value === value;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => onChange(tab.value)}
                        className={iconButton({ active: on })}
                    >
                        {tab.icon && <span className="flex">{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Segmented tabs — contained toolbar ─────────────────────────────── */

const segmentedButton = tv({
    base: [
        "font-sans text-[12.5px] font-medium border-none rounded-md px-3.5 py-1.5 cursor-pointer",
        "text-(--text-600) bg-transparent hover:text-(--text)",
        "transition-[background,color] duration-[120ms]",
    ],
    variants: {
        active: {
            true: "bg-white text-(--text) font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:text-(--text)",
            false: "",
        },
    },
});

export function SegmentedTabs({ tabs, value, onChange, className }: TabsCommonProps) {
    return (
        <div
            role="tablist"
            className={cn(
                "inline-flex gap-0.5 p-[3px] rounded-md border border-(--border) bg-(--subtle-50)",
                className,
            )}
        >
            {tabs.map((tab) => {
                const on = tab.value === value;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => onChange(tab.value)}
                        className={segmentedButton({ active: on })}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Vertical tabs — settings-style panel nav ───────────────────────── */

const verticalButton = tv({
    base: [
        "flex items-center gap-2 text-left w-full px-2.5 py-2 rounded-md border-l-2 border-transparent",
        "font-sans text-[13px] font-medium cursor-pointer bg-transparent border-y border-r-0",
        "text-(--text-600) hover:bg-(--subtle-50) hover:text-(--text) transition-[background,color] duration-[120ms]",
    ],
    variants: {
        active: {
            true: "bg-(--primary-50) border-l-(--primary-600) text-(--primary-600) font-semibold hover:bg-(--primary-50) hover:text-(--primary-600)",
            false: "",
        },
    },
});

export function VerticalTabs({ tabs, value, onChange, className }: TabsCommonProps) {
    return (
        <div
            role="tablist"
            className={cn("flex flex-col gap-px w-40", className)}
        >
            {tabs.map((tab) => {
                const on = tab.value === value;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => onChange(tab.value)}
                        className={verticalButton({ active: on })}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export type { TabsCommonProps, TabItem };
