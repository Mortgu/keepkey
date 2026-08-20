import { Popover } from "@base-ui/react";
import { Children, isValidElement } from "react";
import { tv } from "tailwind-variants";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface BadgeComponentProps extends HTMLAttributes<HTMLSpanElement> {
    variant: "default" | "border";
    rounded: "default" | "full";
    type: "default" | "info" | "success" | "warning" | "error";
}

export const badgeStyles = tv({
    base: ["inline-flex items-center justify-center w-fit", "px-2 py-1 text-xs font-medium"],
    variants: {
        variant: {
            default: "bg-(--success-subtle) text-(--success)",
            border: "border border-(--border)",
        },
        rounded: {
            default: "rounded-md",
            full: "rounded-full",
        },
        type: {
            default: "bg-(--page-bg) text-(--text)",
            info: "bg-(--info-subtle) text-(--info)",
            success: "bg-(--success-subtle) text-(--success)",
            warning: "bg-(--warning-subtle) text-(--warning)",
            error: "bg-(--destructive-subtle) text-(--destructive)",
        },
    },
    compoundVariants: [
        { variant: "border", type: "info", className: "border-(--info)" },
        { variant: "border", type: "success", className: "border-(--success)" },
        { variant: "border", type: "warning", className: "border-(--warning)" },
        { variant: "border", type: "error", className: "border-(--destructive)" },
    ],
    defaultVariants: {
        variant: "default",
        rounded: "default",
        type: "default",
    },
});

const popupStyles = tv({
    base: [
        "min-w-32 max-w-xs w-fit",
        "bg-(--text) text-(--text-inv)",
        "text-xs font-normal leading-[1.45]",
        "px-2.5 py-2 rounded-md shadow-lg",
    ],
});

type BadgePart = "content" | "tooltip";
type Tagged2Component = ElementType & { __BadgePart?: BadgePart };

function partOf2(el: ReactNode): BadgePart | undefined {
    if (isValidElement(el)) {
        return (el.type as Tagged2Component).__BadgePart;
    }
    return undefined;
}

export function Badge({
    variant = "default",
    rounded = "default",
    type = "default",
    className,
    children,
    ...props
}: BadgeComponentProps) {
    const kids = Children.toArray(children);
    const content = kids.filter((c) => partOf2(c) === "content");
    const tooltip = kids.filter((c) => partOf2(c) === "tooltip");
    const rest = kids.filter((c) => partOf2(c) === undefined);

    return (
        <Popover.Root>
            <Popover.Trigger openOnHover render={<span className={badgeStyles({ variant, rounded, type, className })} {...props} />}>
                {content.length > 0 ? content : rest}
            </Popover.Trigger>
            {tooltip}
        </Popover.Root>
    );
}

interface BadgeContentComponentProps {
    children: ReactNode;
}

export function BadgeContent({ children }: BadgeContentComponentProps) {
    return <>{children}</>;
}
BadgeContent.__BadgePart = "content" as const satisfies BadgePart;

interface BadgeTooltipComponentProps {
    children: ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
}

export function BadgeTooltip({ children, side = "bottom", sideOffset = 8 }: BadgeTooltipComponentProps) {
    return (
        <Popover.Portal>
            <Popover.Positioner side={side} sideOffset={sideOffset}>
                <Popover.Popup className={popupStyles()}>{children}</Popover.Popup>
            </Popover.Positioner>
        </Popover.Portal>
    );
}
BadgeTooltip.__BadgePart = "tooltip" as const satisfies BadgePart;

Badge.Content = BadgeContent;
Badge.Tooltip = BadgeTooltip;
