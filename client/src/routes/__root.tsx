import "../i18n";

import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootComponent } from "./-__root.component";
import type { RouterContext } from "@/lib/session";

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    errorComponent: ({ error }) => <>{error}</>,
    pendingComponent: () => <></>,
});
