import { createFileRoute } from "@tanstack/react-router";

import SettingsPage from "./-page";

export const Route = createFileRoute("/_main/settings/")({
    component: SettingsPage,
});
