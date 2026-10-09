import { NavGroup, NavLink, NavSearch, NavUserMenu, SegmentedLanguageToggle, } from "@/components";
import { useAuth } from "@/context/auth-context";
import { useRouterState } from "@tanstack/react-router";
import {
    ChevronDown,
    DollarSign,
    Euro,
    File,
    FileText,
    Languages,
    LayoutGrid,
    Package, Settings,
    ShoppingCart,
    Text,
    Truck,
    UserCircle2,
    Users
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tv } from "tailwind-variants";
import { DEFAULT_LANGUAGE_OPTIONS } from "../elements/language-toggle-options";

const ICON_SIZE = 14;

type SectionProps = {
    title: string;
    collapsible?: boolean;
    /** Pfadpräfixe der Einträge: enthält die aktive Route einen davon, startet die Gruppe offen. */
    paths?: Array<string>;
    children: ReactNode;
};

function Section({ title, collapsible = false, paths = [], children }: SectionProps) {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const containsActive = paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const [collapsed, setCollapsed] = useState(collapsible && !containsActive);

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

/**
 * Im Fuss steht nur noch die Sprachwahl — der Nutzer ist mitsamt Abmelden nach
 * oben in {@link NavUserMenu} gewandert.
 */
function LanguageFooter() {
    const { i18n } = useTranslation();

    return (
        <div className="flex items-center justify-between mx-3.5 py-3.5 border-t border-(--fg-2)">
            <Languages className="size-5 text-(--text-inv)" />
            <SegmentedLanguageToggle
                className="bg-(--fg-2) text-white border-none"
                options={DEFAULT_LANGUAGE_OPTIONS}
                value={i18n.language.toUpperCase()}
                onChange={(lng) => i18n.changeLanguage(lng)}
            />
        </div>
    );
}

export function Navigation() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const isAdmin = (user?.role ?? "")
        .split(",")
        .map((role) => role.trim())
        .includes("admin");

    return (
        <aside className="flex h-screen w-74 flex-col overflow-hidden bg-(--text)">
            {/* Nutzer und Suche stehen oben: der Kontext, in dem man arbeitet,
                und der schnellste Weg irgendwohin. */}
            <div className="flex flex-col gap-2 px-2 pb-2.5 pt-3">
                <NavUserMenu />
                <NavSearch />
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pb-2">
                <Section title={t("nav.overview")}>
                    <NavLink
                        to="/"
                        icon={<LayoutGrid size={ICON_SIZE} />}
                        label="Dashboard"
                    />
                </Section>

                <Section title={t("nav.sales")} collapsible paths={["/customers", "/offers", "/orders"]}>
                    <NavLink
                        to="/customers"
                        label={t("section.customers")}
                        icon={<Users size={ICON_SIZE} />}
                        activeOptions={{ exact: false }}
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
                    {/* <NavLink
                        to="/invoices"
                        label={t("section.invoices")}
                        icon={<ShoppingCart size={ICON_SIZE} />}
                    /> */}
                </Section>

                <Section title={t("nav.catalog")} collapsible paths={["/workloads", "/flatrates", "/contracts"]}>

                    <NavGroup label={t("section.workloads")} icon={<Package size={ICON_SIZE} />} defaultOpen>
                        <NavLink to="/workloads" label={t("section.workload_text")} indent
                            icon={<Text size={ICON_SIZE} />} />
                        <NavLink to="/workloads/pricing" label={t("section.workload_pricing")} indent
                            icon={<Euro size={ICON_SIZE} />} />
                    </NavGroup>

                    <NavLink to="/flatrates" label={t("section.flatRates")} icon={<DollarSign size={ICON_SIZE} />} />

                    <NavLink to="/contracts" label={t("section.contracts")} icon={<Users size={ICON_SIZE} />} />
                </Section>

                <Section title={t("nav.management")} collapsible paths={["/suppliers", "/employees", "/templates", "/settings"]}>
                    <NavLink
                        to="/suppliers"
                        label={t("section.suppliers")}
                        icon={<Truck size={ICON_SIZE} />}
                    />
                    {isAdmin && (
                        <NavLink
                            to="/employees"
                            label={t("section.employees")}
                            icon={<UserCircle2 size={ICON_SIZE} />}
                        />
                    )}
                    <NavLink
                        to="/templates"
                        label={t("section.templates")}
                        icon={<File size={ICON_SIZE} />}
                    />
                    <NavLink
                        to="/settings"
                        label={t("nav.settings")}
                        icon={<Settings size={ICON_SIZE} />}
                    />
                </Section>
            </nav>

            <LanguageFooter />
        </aside>
    );
}
