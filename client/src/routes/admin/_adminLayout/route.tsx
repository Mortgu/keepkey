import { createFileRoute, isRedirect, notFound, Outlet, redirect } from '@tanstack/react-router'
import { NavLink } from "@/routes/-components/nav-link.tsx";
import { useAuth } from "@/context/auth.tsx";
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/admin/_adminLayout')({
    component: AdminLayoutComponent,
    beforeLoad: async ({ location }) => {
        const { data: session } = await authClient.getSession();

        if (!session || !session.user || session.user.role !== 'admin') {
            throw notFound();
        }
    },
    notFoundComponent: ({ data }) => {
        return (
            <div className='max-w-(--viewport) m-auto h-full p-4'>
                <p>Not Found</p>
            </div>
        )
    }
})

function AdminLayoutComponent() {
    const { user } = useAuth();

    if (!user) {
        window.location.assign("/login");
    }

    return (
        <div className='grid gap-4'>
            <div className='w-full h-14 border-b bg-gray-100 border-gray-200'>
                <div className='flex items-center gap-8 w-full max-w-(--viewport) m-auto h-full px-4'>
                    <NavLink variant="primary" to='/admin'>Dashboard</NavLink>
                    <NavLink variant="primary" to='/admin/users'>Accounts</NavLink>
                    <NavLink variant="primary" to='/admin/customers'>Kunden</NavLink>
                    <NavLink variant="primary" to='/admin/products'>Contracts & Products</NavLink>
                    <NavLink variant="primary" to='/admin/orders'>Bestellungen</NavLink>
                    <NavLink variant="primary" to='/admin/offers'>Angebote</NavLink>
                </div>
            </div>

            <div className='w-full max-w-(--viewport) m-auto h-full px-4'>
                <Outlet />
            </div>
        </div>
    );
}
