import { createFileRoute } from "@tanstack/react-router";

import { SettingsLayoutComponent } from "./-layout";

export const Route = createFileRoute("/_main/settings")({
    component: SettingsLayoutComponent,
});
