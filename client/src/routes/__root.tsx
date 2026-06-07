import "../i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { RouterContext } from "@/lib/session";
import { AuthProvider } from "@/context/auth.tsx";

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
