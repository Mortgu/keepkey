import { createRootRoute, Outlet } from '@tanstack/react-router'
import Navigation from './-components/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "@/context/auth.tsx";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Navigation />

                <div className='max-w-(--viewport) m-auto p-4'>
                    <Outlet />
                </div>
            </AuthProvider>
        </QueryClientProvider>
    )
}