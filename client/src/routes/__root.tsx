import { createRootRoute, Outlet } from '@tanstack/react-router'
import Navigation from './-components/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {CartProvider} from "@/context/shopping-cart.tsx";
import {AuthProvider} from "@/context/auth.tsx";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: RootComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider>
                    <Navigation />

                    <div className='max-w-(--viewport) m-auto p-4'>
                        <Outlet />
                    </div>
                </CartProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}