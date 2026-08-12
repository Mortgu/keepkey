import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "./button";
import type { ReactNode } from "react";

export interface ActionMenuItem {
    label: string;
    icon?: ReactNode;
    onSelect?: () => void;
    /** Wenn gesetzt, wird ein <a> gerendert (z. B. für Downloads). */
    href?: string;
    /** Mit href: erzwingt Download statt Navigation. */
    download?: string;
    danger?: boolean;
    disabled?: boolean;
    /** Kurze Begründung unter dem Label — gedacht für deaktivierte Einträge. */
    hint?: string;

    condition?: boolean;

}

export interface ActionMenuProps {
    items: Array<ActionMenuItem>;
    className?: string;
    /** Accessible label for the trigger button. */
    label?: string;
    icon?: ReactNode;
}

/**
 * Ellipsis trigger that opens a small action list. Stops click propagation so
 * it can sit inside a clickable table row without triggering the row handler.
 */
export function ActionMenu({ items, className, label = "Aktionen", icon }: ActionMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const resolvedIcon = icon ? icon : <EllipsisVertical size={14} />

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
                icon={resolvedIcon}
                onClick={() => setOpen((o) => !o)}
            />

            {open && (
                <div role="menu" className="absolute top-[calc(100%+4px)] right-0 z-50 min-w-fit overflow-hidden rounded-md border border-(--border) bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.10)]">
                    {items.map((item) => (
                        <ActionMenuItem key={item.label} item={item} setOpen={setOpen} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ActionMenuItemProps {
    item: ActionMenuItem;
    setOpen: (value: boolean) => void;
}

function ActionMenuItem({ item, setOpen }: ActionMenuItemProps) {
    const { label, icon, onSelect, href, download, danger, disabled, hint, condition = true } = item;
    const isDisabled = disabled || !condition;

    const className = [
        "flex w-full items-start gap-2 px-3 py-[7px] text-left text-sm transition-colors duration-80",
        isDisabled ? "cursor-not-allowed opacity-50" : "",
        danger
            ? "text-(--destructive) hover:bg-(--destructive-subtle)"
            : "text-(--text) hover:bg-(--page-bg)",
    ].join(" ");

    if (href && !isDisabled) {
        return (
            <a
                key={label}
                role="menuitem"
                href={href}
                download={download}
                onClick={() => setOpen(false)}
                className={className}
            >
                {icon}
                <span className="flex-1 whitespace-pre">{label}</span>
            </a>
        );
    }

    return (
        <button
            key={label}
            type="button"
            role="menuitem"
            disabled={isDisabled}
            onClick={() => {
                onSelect?.();
                setOpen(false);
            }}
            className={className}
        >
            {icon}
            <span className="flex-1">
                <span className="block whitespace-pre">{label}</span>
                {hint && <span className="block max-w-[22rem] text-xs text-(--text-secondary)">{hint}</span>}
            </span>
        </button>
    );
}