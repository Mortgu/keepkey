import { tv } from "tailwind-variants";
import type { HTMLAttributes, ReactNode } from "react";

export interface TooltipComponentProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
    content: ReactNode;
    children: ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}

const sideStyles = tv({
    base: "absolute z-10 min-w-32 w-fit bg-(--text) text-(--text-inv) text-xs font-normal leading-[1.45] px-2.5 py-2 rounded-md shadow-lg opacity-0 pointer-events-none transition-[opacity,transform] duration-120 ease-out group-hover:opacity-100 group-focus-within:opacity-100",
    variants: {
        side: {
            top: "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 translate-y-0.5 group-hover:translate-y-0",
            bottom: "top-[calc(100%+6px)] left-1/2 -translate-x-1/2 -translate-y-0.5 group-hover:translate-y-0",
            left: "right-[calc(100%+6px)] top-1/2 -translate-y-1/2 translate-x-0.5 group-hover:translate-x-0",
            right: "left-[calc(100%+6px)] top-1/2 -translate-y-1/2 -translate-x-0.5 group-hover:translate-x-0",
        },
    },
    defaultVariants: {
        side: "bottom",
    },
});

const arrowStyles = tv({
    base: "absolute content-[''] min-w-fit w-fit h-2 bg-(--text) rotate-45",
    variants: {
        side: {
            top: "bottom-[-4px] left-1/2 -translate-x-1/2",
            bottom: "top-[-4px] left-1/2 -translate-x-1/2",
            left: "right-[-4px] top-1/2 -translate-y-1/2",
            right: "left-[-4px] top-1/2 -translate-y-1/2",
        },
    },
    defaultVariants: {
        side: "bottom",
    },
});

export function Tooltip({ content, children, side = "bottom", className, ...rest }: TooltipComponentProps) {
    return (
        <span
            className={`relative group inline-flex cursor-pointer ${className ?? ""}`.trim()}
            tabIndex={0}
            {...rest}
        >
            {children}
            <span className={sideStyles({ side })}>
                <span className={arrowStyles({ side })} />
                {content}
            </span>
        </span>
    );
}