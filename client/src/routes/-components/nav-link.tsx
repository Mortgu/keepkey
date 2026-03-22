import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const styles = tv({
    base: "transition-colors", // Add common transition logic here
    variants: {
        variant: {
            primary: "flex items-center justify-center h-full border-b-2 border-transparent", // Transparent border prevents layout shift
            filled: "px-4 py-2 rounded-md",
        },
        isActive: {
            true: "",
        },
    },
    compoundVariants: [
        {
            variant: "primary",
            isActive: true,
            class: "border-(--keepit-primary) text-(--keepit-primary)",
        },
        {
            variant: "filled",
            isActive: true,
            class: "bg-(--keepit-primary) text-white",
        },
    ],
    defaultVariants: {
        variant: "primary",
    },
});

type StyleVariants = VariantProps<typeof styles>;

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: StyleVariants["variant"];
};

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <a
                ref={ref}
                {...props}
                className={styles({ variant, className })}
            />
        );
    }
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const NavLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
    return (
        <CreatedLinkComponent
            {...props}
            activeProps={{
                className: styles({ variant: props.variant, isActive: true }),
            }}
        />
    );
};