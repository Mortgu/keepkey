import { createRootRoute, Outlet } from '@tanstack/react-router'
import Navigation from './-components/navigation';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <Navigation />

            <div className='max-w-(--viewport) m-auto p-4'>
                <Outlet />
            </div>
        </QueryClientProvider>
    )
}