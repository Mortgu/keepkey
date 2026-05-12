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
} from "lucide-react";

import { authClient } from "@/lib/auth-client.ts";
import { NavGroup, NavLink } from "./nav-link";
import { useMemo, useState, type ReactNode } from "react";

const ICON_SIZE = 14;

type SectionProps = {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
};

function Section({ title, collapsible = false, children }: SectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => collapsible && setCollapsed((v) => !v)}
        className="flex select-none items-center justify-between px-3.5 pb-1 pt-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-(--fg-3)"
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

function SectionDivider() {
  return <div className="mx-3.5 mt-2 h-px bg-(--fg-2)" />;
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
      <button
        type="button"
        title="Abmelden"
        onClick={() => authClient.signOut()}
        className="flex rounded p-1.5 text-(--fg-3) transition-colors hover:bg-(--subtle-50) hover:text-(--destructive)"
      >
        <LogOut size={ICON_SIZE} />
      </button>
    </div>
  );
}

export function Navigation() {
  return (
    <aside className="flex h-screen w-65 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 pb-2.5 pt-4">

        <span className="text-[14px] font-semibold tracking-[-0.01em] text-(--text-inv)">
          Dignum
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pb-2">
        <Section title="Übersicht">
          <NavLink to="/" icon={<LayoutGrid size={ICON_SIZE} />} label="Dashboard" />
        </Section>

        <SectionDivider />
        <Section title="Katalog" collapsible>

          <NavGroup label="Produkte" defaultOpen icon={<Package size={ICON_SIZE} />}>
            <NavLink to="/products" indent label="Alle Produkte" />
            <NavLink to="/products/pricing" indent label="Preise" />
            <NavLink to="/products/flatrates" indent label="Flatrates" />
          </NavGroup>

          <NavLink to="/suppliers" label="Lieferanten" icon={<Truck size={ICON_SIZE} />} />
          <NavLink to="/contracts" label="Verträge" icon={<Users size={ICON_SIZE} />} />

        </Section>

        <SectionDivider />
        <Section title="Vertrieb" collapsible>
          <NavLink
            to="/customers"
            icon={<Users size={ICON_SIZE} />}
            label="Kunden"
          />
          <NavLink
            to="/offers"
            icon={<FileText size={ICON_SIZE} />}
            label="Angebote"
          />
          <NavLink
            to="/orders"
            icon={<ShoppingCart size={ICON_SIZE} />}
            label="Bestellungen"
          />
        </Section>

        <SectionDivider />
        <Section title="Verwaltung" collapsible>
          <NavLink
            to="/employees"
            icon={<UserCircle2 size={ICON_SIZE} />}
            label="Mitarbeiter"
          />
          <NavLink
            to="/user"
            icon={<Settings size={ICON_SIZE} />}
            label="Einstellungen"
          />
        </Section>
      </nav>

      <UserFooter />
    </aside>
  );
}
