import { cn } from "@/lib/utils";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref: React.Ref<HTMLAnchorElement>
};

const BasicLinkComponent = ({ className, ref, ...props }: BasicLinkProps) => {
    return <a ref={ref} {...props} className={cn(className)} />
}

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const NavLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
    return (
        <CreatedLinkComponent
            activeProps={{className: "border-b-2 border-(--keepit-primary) text-(--keepit-primary)"}}
            className={cn(props.className, "flex items-center justify-center px-4 h-full w-auto border-b-2  border-white")} {...props} />
    )
}