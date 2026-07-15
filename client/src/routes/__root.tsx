import "../i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { RouterContext } from "@/lib/session";
import { AuthProvider } from "@/context/auth.tsx";
import { PageHeaderSkeleton, RouteError } from "@/components";
import { showToast } from "@/components/toast/toast";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: (error) => {
                const message = error instanceof Error ? error.message : undefined;
                showToast.error("common.errorGeneric", { message });
            },
        },
    },
});

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
    errorComponent: ({ error }) => <RouteError error={error} />,
    pendingComponent: () => <PageHeaderSkeleton />,
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
