import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "./button";
import type { ReactNode } from "react";

export interface ActionMenuItem {
    label: string;
    icon?: ReactNode;
    onSelect: () => void;
    danger?: boolean;
    disabled?: boolean;
}

export interface ActionMenuProps {
    items: Array<ActionMenuItem>;
    className?: string;
    /** Accessible label for the trigger button. */
    label?: string;
}

/**
 * Ellipsis trigger that opens a small action list. Stops click propagation so
 * it can sit inside a clickable table row without triggering the row handler.
 */
export function ActionMenu({ items, className, label = "Aktionen" }: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div
            ref={ref}
            className={`relative flex justify-center ${className ?? ""}`}
            onClick={(e) => e.stopPropagation()}
        >
            <Button
                type="button"
                variant="ghost"
                size="xs"
                iconOnly
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                icon={<EllipsisVertical className="size-4 text-(--border-200)" />}
                onClick={() => setOpen((o) => !o)}
            />

            {open && (
                <div
                    role="menu"
                    className="absolute top-[calc(100%+4px)] right-0 z-50 min-w-[184px] overflow-hidden rounded-md border border-(--border) bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
                >
                    {items.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            disabled={item.disabled}
                            onClick={() => {
                                setOpen(false);
                                item.onSelect();
                            }}
                            className={[
                                "flex w-full items-center gap-2 px-3 py-[7px] text-left text-sm transition-colors duration-80",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                                item.danger
                                    ? "text-(--destructive) hover:bg-(--destructive-subtle)"
                                    : "text-(--text) hover:bg-(--page-bg)",
                            ].join(" ")}
                        >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
