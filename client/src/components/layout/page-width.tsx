import { tv } from "tailwind-variants";
import type { ReactNode } from "react";

export interface PageWidthProps {
    variant?: "full" | "constrained";
    className?: string;
    children: ReactNode;
}

const styles = tv({
    base: "w-full m-auto h-full",
    variants: {
        variant: {
            full: "",
            constrained: "max-w-(--viewport)",
        },
    },
    defaultVariants: {
        variant: "constrained",
    },
});

export function PageWidth({ variant, className, children }: PageWidthProps) {
    return <div className={styles({ variant, className })}>{children}</div>;
}
