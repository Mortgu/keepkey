import type { ReactNode } from "react";
import { useState } from "react";
import {
    ChevronDown,
    DollarSign,
    FileText,
    Languages,
    LayoutGrid,
    LogOut,
    Package,
    Settings,
    ShoppingCart,
    Truck,
    UserCircle2,
    Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { tv } from "tailwind-variants";
import { NavGroup, NavLink } from "./nav-link.js";
import { Button, DEFAULT_LANGUAGE_OPTIONS, SegmentedLanguageToggle, } from "@/components";
import { useAuth } from "@/context/auth";

const ICON_SIZE = 14;

type SectionProps = {
    title: string;
    collapsible?: boolean;
    children: ReactNode;
};

function Section({ title, collapsible = false, children }: SectionProps) {
    const [collapsed, setCollapsed] = useState(false);

    const sectionStyle = tv({
        base: [
            "flex select-none items-center justify-between",
            "px-3.5 pb-1.5 pt-3 text-[12px] font-semibold",
            "uppercase tracking-[0.08em] text-(--fg-3)",
        ],
    });

    return (
        <>
            <button
                type="button"
                onClick={() => collapsible && setCollapsed((v) => !v)}
                className={sectionStyle()}
                style={{ cursor: collapsible ? "pointer" : "default" }}
            >
                <span>{title}</span>
                {collapsible && (
                    <ChevronDown
                        size={11}
                        strokeWidth={2.4}
                        className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""
                            }`}
                    />
                )}
            </button>
            {!collapsed && <div className="flex flex-col gap-0.5">{children}</div>}
        </>
    );
}

function UserFooter() {
    const { i18n } = useTranslation();
    const { user, logout } = useAuth();

    const displayName = user ? `${user.firstName} ${user.lastName}` : null;

    return (
        <div>
            {/* Language toggle */}
            <div className="flex items-center justify-between mx-3.5 py-3.5 border-t border-(--fg-2)">
                <Languages className="size-5 text-(--text-inv)" />
                <SegmentedLanguageToggle
                    className="bg-(--fg-2) text-white border-none"
                    options={DEFAULT_LANGUAGE_OPTIONS}
                    value={i18n.language.toUpperCase()}
                    onChange={(lng) => i18n.changeLanguage(lng)}
                />
            </div>

            {user && (
                <div className="flex items-center gap-2.5 border-t border-(--fg-2) mx-3.5 py-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--primary-100)">
                        <UserCircle2 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 text-white">
                        <p className="text-[13px] font-semibold">{displayName}</p>
                        <p className="text-[11px] text-(--fg-3)">{user.email}</p>
                    </div>
                    <Button variant='ghost' size='sm' onClick={logout}
                        icon={<LogOut className="size-4 " />} iconOnly />
                </div>
            )}
        </div>
    );
}

export function Navigation() {
    const { t } = useTranslation();

    return (
        <aside className="flex h-screen w-74 flex-col overflow-hidden bg-(--text)">
            <div className="grid items-center justify-between gap-2 px-4 pb-2.5 pt-4">
                <h1 className="text-lg font-semibold tracking-[-0.01em] text-(--text-inv)">
                    dignum
                </h1>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pb-2">
                <Section title={t("nav.overview")}>
                    <NavLink
                        to="/"
                        icon={<LayoutGrid size={ICON_SIZE} />}
                        label="Dashboard"
                    />
                </Section>

                <Section title={t("nav.catalog")} collapsible>

                    <NavGroup label={t("section.workloads")} icon={<Package size={ICON_SIZE} />} defaultOpen>
                        <NavLink to="/workloads" label={t("section.workload_text")} indent />
                        <NavLink to="/workloads/pricing" label={t("section.workload_pricing")} indent />
                    </NavGroup>

                    <NavLink to="/flatrates" label={t("section.flatRates")} icon={<DollarSign size={ICON_SIZE} />} />

                    <NavLink to="/contracts" label={t("section.contracts")} icon={<Users size={ICON_SIZE} />} />
                </Section>

                <Section title={t("nav.sales")} collapsible>
                    <NavLink
                        to="/customers"
                        label={t("section.customers")}
                        icon={<Users size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/offers"
                        label={t("section.offers")}
                        icon={<FileText size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/orders"
                        label={t("section.orders")}
                        icon={<ShoppingCart size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/invoices"
                        label={t("section.invoices")}
                        icon={<ShoppingCart size={ICON_SIZE} />}
                    />
                </Section>

                <Section title={t("nav.management")} collapsible>
                    <NavLink
                        to="/suppliers"
                        label={t("section.suppliers")}
                        icon={<Truck size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/employees"
                        label={t("section.employees")}
                        icon={<UserCircle2 size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/settings"
                        label={t("nav.settings")}
                        icon={<Settings size={ICON_SIZE} />}
                    />
                </Section>
            </nav>

            <UserFooter />
        </aside>
    );
}
