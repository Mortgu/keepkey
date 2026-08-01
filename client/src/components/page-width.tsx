import { tv } from "tailwind-variants";
import type { ReactNode } from "react";

export interface PageWidthProps {
    variant?: "none" | "full" | "default";
    className?: string;
    children: ReactNode;
}

const styles = tv({
    base: [
        "bg-white max-h-screen h-screen overflow-y-scroll"
    ],
    variants: {
        variant: {
            none: "w-full",
            full: "w-full m-auto h-full p-6",
            default: "w-full max-w-(--viewport) m-auto h-full p-6",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export function PageWidth({ variant, className, children }: PageWidthProps) {
    return <div className={styles({ variant, className })}>{children}</div>;
}
