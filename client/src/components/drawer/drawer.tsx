import { useEffect, useCallback } from "react";
import { XIcon } from "lucide-react";
import { tv } from "tailwind-variants";
import { Button } from "@/components";
import type { DrawerProps, DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps } from "./drawer-types";

const scrimStyles = tv({
    base: [
        "fixed inset-0 z-40 transition-opacity duration-200",
        "bg-[rgba(17,26,20,0.38)]",
    ],
    variants: {
        open: {
            true: "opacity-100 pointer-events-auto",
            false: "opacity-0 pointer-events-none",
        },
    },
});

const drawerStyles = tv({
    base: [
        "fixed top-0 right-0 bottom-0 z-50",
        "bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.12)]",
        "flex flex-col",
        "transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        "will-change-transform",
        "max-w-[92vw]",
    ],
    variants: {
        open: {
            true: "translate-x-0",
            false: "translate-x-full",
        },
        wide: {
            true: "w-[540px]",
            false: "w-[420px]",
        },
    },
    defaultVariants: {
        open: false,
        wide: false,
    },
});

function DrawerHeader({ eyebrow, title, subtitle }: DrawerHeaderProps) {
    return (
        <>
            {eyebrow && (
                <div className="text-[11px] font-semibold text-(--primary-600) uppercase tracking-[0.06em] mb-1">
                    {eyebrow}
                </div>
            )}
            <div className="text-[17px] font-semibold text-(--text-primary) tracking-[-0.01em] leading-snug">
                {title}
            </div>
            {subtitle && (
                <div className="text-[13px] text-gray-400 mt-0.5">
                    {subtitle}
                </div>
            )}
        </>
    );
}

function DrawerBody({ children }: DrawerBodyProps) {
    return <>{children}</>;
}

function DrawerFooter({ children }: DrawerFooterProps) {
    return <>{children}</>;
}

function Drawer({ open, onClose, children, wide, className }: DrawerProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    const childArray = Array.isArray(children) ? children : [children];
    const header = childArray.find((c: any) => c?.type === DrawerHeader);
    const body = childArray.find((c: any) => c?.type === DrawerBody);
    const footer = childArray.find((c: any) => c?.type === DrawerFooter);

    return (
        <>
            <div
                className={scrimStyles({ open })}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className={drawerStyles({ open, wide, className })}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between gap-3 px-[22px] py-[18px] border-b border-(--border) shrink-0">
                    <div>{header}</div>
                    <Button
                        className="shrink-0 -mt-1 -mr-1"
                        onClick={onClose}
                        variant="ghost"
                        size="xs"
                        icon={<XIcon className="size-4" />}
                        iconOnly
                    />
                </div>

                <div className="px-[22px] py-5 overflow-y-auto flex-1 flex flex-col gap-[18px]">
                    {body}
                </div>

                {footer && (
                    <div className="px-[22px] py-[14px] border-t border-(--border) bg-(--subtle-50) flex gap-2 items-center shrink-0">
                        {footer}
                    </div>
                )}
            </aside>
        </>
    );
}

Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;

export { Drawer };
