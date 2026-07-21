import * as React from "react";
import { createLink } from "@tanstack/react-router";
import { tv } from "tailwind-variants";
import { FileText, ShieldCheck, UserCircle } from "lucide-react";
import type { LinkComponent } from "@tanstack/react-router";

const ICON_SIZE = 16;

const itemStyles = tv({
    base: [
        "flex items-center gap-2.5 rounded-md text-sm font-normal text-(--fg-1)",
        "px-3 py-2 transition-colors hover:bg-(--subtle-50)",
        "cursor-pointer whitespace-nowrap",
    ],
    variants: {
        isActive: {
            true: "bg-(--primary-100) text-(--primary) font-medium hover:bg-(--primary-100)",
            false: "",
        },
    },
    defaultVariants: { isActive: false },
});

type SettingsLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    icon?: React.ReactNode;
    label?: React.ReactNode;
};

const SettingsLinkComponent = React.forwardRef<HTMLAnchorElement, SettingsLinkProps>(
    ({ className, icon, label, children, ...props }, ref) => (
        <a ref={ref} className={className} {...props}>
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="truncate text-left">{label ?? children}</span>
        </a>
    ),
);

const CreatedSettingsLink = createLink(SettingsLinkComponent);

const SettingsSidebarLink = ((props: any) => (
    <CreatedSettingsLink
        activeOptions={{ exact: true }}
        {...props}
        activeProps={{
            className: itemStyles({ isActive: true }),
        }}
    />
)) as LinkComponent<typeof SettingsLinkComponent>;

const navItems = [
    { to: "/settings/account", label: "Konto", icon: <UserCircle size={ICON_SIZE} /> },
    { to: "/settings/security", label: "Sicherheit", icon: <ShieldCheck size={ICON_SIZE} /> },
    { to: "/settings/templates", label: "Vorlagen", icon: <FileText size={ICON_SIZE} /> },
];

export function SettingsSidebar() {
    return (
        <div className="p-3  border-r border-(--border)">

            {/* Desktop sidebar */}
            <aside className="w-64 hidden md:flex flex-col gap-1 shrink-0">
                {navItems.map((item) => (
                    <SettingsSidebarLink
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        icon={item.icon}
                        className={itemStyles()}
                    />
                ))}
            </aside>

            {/* Mobile tab bar */}
            <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-(--border) pb-2 mb-2">
                {navItems.map((item) => (
                    <SettingsSidebarLink
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        icon={item.icon}
                        className={itemStyles()}
                    />
                ))}
            </nav>
        </div>
    );
}
