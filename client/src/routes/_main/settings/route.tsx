import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SettingsSidebar } from "./-components/settings-sidebar.tsx";
import { PageWidth } from "@/components";

export const Route = createFileRoute("/_main/settings")({
    component: () => (
        <PageWidth variant="none">
            <div className="grid gap-4 h-full">
                <div className="flex flex-col md:flex-row h-full">
                    <SettingsSidebar />

                    <PageWidth variant="full">
                        <div className="flex-1 min-w-0">
                            <Outlet />
                        </div>
                    </PageWidth>
                </div>
            </div>
        </PageWidth>
    ),
});