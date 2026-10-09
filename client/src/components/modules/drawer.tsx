import { Button } from "@/components";
import { XIcon } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { Children, Fragment, isValidElement, useCallback, useEffect } from "react";
import { tv } from "tailwind-variants";


/**
 * Slots für einen base-ui-Drawer (Swipe-fähiges Seitenpanel mit Stacking für
 * verschachtelte Drawer). Ablösung für das handgebaute `Drawer` aus `drawer.tsx` —
 * bis die Migration durch ist, existieren beide nebeneinander.
 */
export const drawerStyles = tv({
    slots: {
        Backdrop: '[--backdrop-opacity:0.2] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute',

        Viewport: '[--viewport-padding:0px] fixed inset-0 flex items-stretch justify-end',

        Popup: [
            '[--bleed:0px] [--peek:1rem] [--stack-step:0.05]',
            '[--stack-progress:clamp(0,var(--drawer-swipe-progress),1)]',
            '[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]',
            '[--stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))]',
            '[--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)]',
            'group/popup bg-white',
            'h-full w-[25rem] max-w-[calc(100vw-3rem)]',
            'shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto',
            '[transform-origin:calc(100%-var(--bleed))_50%]',
            '[transform:translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--stack-scale))]',
            'transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
            'data-swiping:select-none data-swiping:duration-0 data-nested-drawer-swiping:duration-0',
            'data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))]',
            'data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))]',
            'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
        ],

        Content: 'transition-opacity duration-[300ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100',

        Title: 'text-md font-medium',
    }
});


export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children?: ReactNode;
    wide?: boolean;
    className?: string;
}

export interface DrawerHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    className?: string;
}

export interface DrawerBodyProps {
    children?: ReactNode;
    className?: string;
}

export interface DrawerFooterProps {
    children?: ReactNode;
    className?: string;
}

const scrimStyles = tv({
    base: [
        "fixed inset-0 z-40 transition-opacity duration-200",
        "bg-(--scrim)",
    ],
    variants: {
        open: {
            true: "opacity-100 pointer-events-auto",
            false: "opacity-0 pointer-events-none",
        },
    },
});

const legacyDrawerStyles = tv({
    base: [
        "fixed top-0 right-0 bottom-0 z-50 transition-all",
        "bg-white shadow-(--shadow-drawer)",
        "flex flex-col",
        "transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        "will-change-transform",
        "max-w-[92vw]",
    ],
    variants: {
        open: {
            true: "translate-x-0",
            false: "translate-x-full shadow-none",
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

/**
 * Flattens `<>…</>` wrappers so the slot lookup below still finds Drawer.Header
 * / Body / Footer when a caller wraps them for conditional rendering. Also
 * drops null / false entries, which `{cond && <Slot/>}` produces.
 */
function flattenFragments(children: ReactNode): Array<ReactNode> {
    return Children.toArray(children).flatMap((child) =>
        isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
            ? flattenFragments(child.props.children)
            : child,
    );
}

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
                <div className="text-[13px] text-(--text-secondary) mt-0.5">
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

    const childArray = flattenFragments(children);
    const findSlot = (slot: ElementType) =>
        childArray.find((c) => isValidElement(c) && c.type === slot);

    const header = findSlot(DrawerHeader);
    const body = findSlot(DrawerBody);
    const footer = findSlot(DrawerFooter);

    return (
        <>
            <div
                className={scrimStyles({ open })}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className={legacyDrawerStyles({ open, wide, className })}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between gap-3 px-[22px] py-[18px] border-b border-(--border) shrink-0">
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

                <div className="px-[22px] py-5 overflow-y-auto flex-1 flex flex-col">
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
