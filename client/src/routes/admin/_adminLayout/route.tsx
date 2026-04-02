import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NavLink } from "@/routes/-components/nav-link.tsx";
import { useAuth } from "@/context/auth.tsx";

export const Route = createFileRoute('/admin/_adminLayout')({
    component: AdminLayoutComponent,
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
                    <NavLink variant="primary" to='/admin/users'>Users</NavLink>
                    <NavLink variant="primary" to='/admin/products'>Contracts & Products</NavLink>
                    <NavLink variant="primary" to='/admin/orders'>Orders</NavLink>
                </div>
            </div>

            <div className='w-full max-w-(--viewport) m-auto h-full px-4'>
                <Outlet />
            </div>
        </div>
    );
}
