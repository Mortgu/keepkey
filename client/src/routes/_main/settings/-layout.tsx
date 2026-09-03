import { Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { SettingsSidebar } from "./-components/settings-sidebar.tsx";
import { Breadcrumbs } from "@/components";

/**
 * Rahmen der Einstellungen: dieselbe Kopfleiste wie jede andere Seite, darunter
 * die eigene Navigation der Unterseiten.
 *
 * Kein `PageWidth` mehr — das Scrollen liegt in `#app`, die Komponente brächte
 * hier nur einen zweiten Scrollbereich mit.
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

            <div className="flex flex-col md:flex-row">
                <SettingsSidebar />

                <div className="flex-1 min-w-0 p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
