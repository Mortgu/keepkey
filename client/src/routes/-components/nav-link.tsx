import { cn } from "@/lib/utils";
import { createLink, type LinkComponent } from "@tanstack/react-router";

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref: React.Ref<HTMLAnchorElement>
};

const BasicLinkComponent = ({ className, ref, ...props }: BasicLinkProps) => {
    return <a ref={ref} {...props} className={cn('nav-link', className)} />
}

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const NavLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
    return (
        <CreatedLinkComponent activeProps={{ className: "active-nav-link" }} {...props} />
    )
}