import {
  ChevronDown,
  FileText,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  UserCircle2,
  Truck,
  DollarSign,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { authClient } from "@/lib/auth-client.ts";
import { NavLink } from "./nav-link";
import { useMemo, useState, type ReactNode } from "react";
import {Button, type DropdownOption, SingleDropdown} from "@/components";
import {tv} from "tailwind-variants";

const ICON_SIZE = 14;

type SectionProps = {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
};

function Section({ title, collapsible = false, children }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const  sectionStyle = tv({
    base: [
        "flex select-none items-center justify-between",
        "px-3.5 pb-1.5 pt-3 text-[12px] font-semibold",
        "uppercase tracking-[0.08em] text-(--fg-3)"
    ],
  })

  return (
    <>
      <button type="button" onClick={() => collapsible && setCollapsed((v) => !v)}
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
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const initials = useMemo(() => {
    if (!user) return "";
    const first = user.firstName?.[0] ?? user.name?.[0] ?? "";
    const last = user.lastName?.[0] ?? "";
    return (first + last).toUpperCase();
  }, [user]);

  const displayName =
    user && (user.firstName || user.lastName)
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.name ?? "—";

  return (
    <div className="flex items-center gap-2.5 border-t border-(--fg-3) px-3.5 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--primary) text-[11px] font-semibold text-white">
        {initials || <UserCircle2 size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-(--text-inv)">
          {displayName}
        </div>
        <div className="truncate text-[11px] text-(--fg-3)">
          {user?.email ?? ""}
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={() => authClient.signOut()} icon={<LogOut size={ICON_SIZE} />} iconOnly className="text-white" />
    </div>
  );
}

const languageDropdownOptions: DropdownOption[] = [
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
]

export function Navigation() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <aside className="flex h-screen w-74 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 pb-2.5 pt-4">

        <h1 className="text-lg font-normal tracking-[-0.01em] text-(--text-inv)">
          dignum GmbH
        </h1>

        <SingleDropdown label="Test" options={languageDropdownOptions} value={i18n.language} onChange={(e) => changeLanguage(e as string)} />

      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pb-2">
        <Section title={t('overview')}>
          <NavLink to="/" icon={<LayoutGrid size={ICON_SIZE} />} label="Dashboard" />
        </Section>

        <Section title={t('catalog')} collapsible>

          <NavLink to="/products" label={t('products')} icon={<Package size={ICON_SIZE} />} />
          <NavLink to="/products/pricing" label={t('pricing')} icon={<DollarSign size={ICON_SIZE} />} />
          <NavLink to="/products/flatrates" label={t('flatRates')} icon={<DollarSign size={ICON_SIZE} />} />

          <NavLink to="/suppliers" label={t('suppliers')} icon={<Truck size={ICON_SIZE} />} />
          <NavLink to="/contracts" label={t('contracts')} icon={<Users size={ICON_SIZE} />} />

        </Section>

        <Section title={t('sales')} collapsible>
          <NavLink to="/customers" label={t('customers')}  icon={<Users size={ICON_SIZE} />} />
          <NavLink to="/offers" label={t('offers')}  icon={<FileText size={ICON_SIZE} />} />
          <NavLink to="/orders" label={t('orders')} icon={<ShoppingCart size={ICON_SIZE} />} />
        </Section>

        <Section title={t('management')} collapsible>
          <NavLink to="/employees" label={t('employees')} icon={<UserCircle2 size={ICON_SIZE} />} />
          <NavLink to="/user" label={t('settings')} icon={<Settings size={ICON_SIZE} />} />
        </Section>

      </nav>

      <UserFooter />
    </aside>
  );
}
