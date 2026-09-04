import { Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { SettingsTabs } from "./-components/settings-tabs";
import { Breadcrumbs } from "@/components";

/**
 * Rahmen der Einstellungen: Kopfleiste wie auf jeder Seite, darunter die Reiter
 * der Unterseiten und darunter deren Inhalt.
 *
 * Die Reiter lagen vorher als Seitenleiste links daneben. Als Zeile über dem
 * Inhalt bekommt dieser die volle Breite, und die Einstellungen lesen sich wie
 * die Kundendetailseite, die dieselbe Aufteilung benutzt.
 */
export function SettingsLayoutComponent() {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("nav.settings"), to: "/settings" },
                    ]}
                />
            </div>

            <SettingsTabs />

            <Outlet />
        </div>
    );
}
