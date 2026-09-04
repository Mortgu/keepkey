import * as React from "react";
import { createLink } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { tv } from "tailwind-variants";
import { FileText, ShieldCheck, UserCircle } from "lucide-react";
import type { LinkComponent } from "@tanstack/react-router";

const ICON_SIZE = 15;

/**
 * Die Unterstrich-Optik der `Tabs`-Komponente, hier aber auf Links statt auf
 * Knöpfen: die Unterseiten der Einstellungen sind eigene Routen, und als
 * `<a href>` bleiben Mittelklick und „in neuem Tab öffnen" erhalten.
 */
const tabStyles = tv({
    base: [
        "flex items-center gap-[7px] px-1 py-2.5 whitespace-nowrap",
        "font-sans text-[13.5px] font-medium cursor-pointer border-b-2 border-transparent",
        "text-(--fg-3) hover:text-(--text-600) transition-colors duration-[140ms]",
    ],
    variants: {
        isActive: {
            true: "text-(--primary-600) hover:text-(--text) border-(--primary-600)",
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

type SettingsTabLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string;
};

const SettingsTabLink = ((props: SettingsTabLinkProps) => (
    <CreatedSettingsLink
        activeOptions={{ exact: true }}
        {...props}
        activeProps={{
            className: tabStyles({ isActive: true }),
        }}
    />
)) as LinkComponent<typeof SettingsLinkComponent>;

/** `labelKey` statt `label`: der Text wird erst beim Rendern aufgelöst, sonst
    stünde er in einer Konstanten fest, bevor die Sprache bekannt ist. */
const navItems = [
    { to: "/settings/account", labelKey: "settings.account", icon: <UserCircle size={ICON_SIZE} /> },
    { to: "/settings/security", labelKey: "settings.security", icon: <ShieldCheck size={ICON_SIZE} /> },
    { to: "/settings/templates", labelKey: "settings.templates", icon: <FileText size={ICON_SIZE} /> },
];

export function SettingsTabs() {
    const { t } = useTranslation();

    return (
        <nav role="tablist" className="flex gap-4 overflow-x-auto border-b border-(--border)">
            {navItems.map((item) => (
                <SettingsTabLink
                    key={item.to}
                    to={item.to}
                    label={t(item.labelKey)}
                    icon={item.icon}
                    className={tabStyles()}
                />
            ))}
        </nav>
    );
}
