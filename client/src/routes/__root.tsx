import "../i18n";

import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { RouterContext } from "@/lib/session";
import { AuthProvider } from "@/context/auth.tsx";
import { PageHeaderSkeleton, RouteError } from "@/components";

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    errorComponent: ({ error }) => <RouteError error={error} />,
    pendingComponent: () => <PageHeaderSkeleton />,
});

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
