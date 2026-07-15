import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SettingsSidebar } from "./-components/settings-sidebar.tsx";
import { PageWidth } from "@/components";

export const Route = createFileRoute("/_main/settings")({
    component: () => (
        <PageWidth>
            <div className="grid gap-4 ">
                <h1 className="text-2xl font-semibold">Einstellungen</h1>

                <div className="flex flex-col md:flex-row gap-4 h-full">
                    <SettingsSidebar />

                    <div className="flex-1 min-w-0">
                        <Outlet />
                    </div>
                </div>
            </div>
        </PageWidth>
    ),
});