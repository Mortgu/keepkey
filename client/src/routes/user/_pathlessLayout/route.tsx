import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NavLink } from "@/routes/-components/nav-link.tsx";
import { Car, ScrollText, Settings } from "lucide-react";
import { useAuth } from "@/context/auth.tsx";

export const Route = createFileRoute('/user/_pathlessLayout')({
    component: PathlessLayoutComponent,
})

function PathlessLayoutComponent() {
    const { user } = useAuth();

    console.log(user);

    if (!user) {
        window.location.assign("/login");
    }

    return (
        <div className='grid gap-4'>
            <div className='flex items-center justify-between border rounded-md p-3 border-gray-300'>
                <div className='flex h-full gap-2'>
                    <NavLink className='flex items-center gap-2' variant="filled" to='/user/settings'>
                        <Settings className="size-4" />
                        Settings
                    </NavLink>
                    <NavLink className='flex items-center gap-2' variant="filled" to='/user/offers'>
                        <ScrollText className="size-5" />
                        My Offers
                    </NavLink>
                    <NavLink className='flex items-center gap-2' variant="filled" to='/user/orders'>
                        <Car className="size-5" />
                        My Orders
                    </NavLink>
                </div>

                {(user && user.role === "admin") && (
                    <div className='flex flex-col gap-2'>
                        <NavLink variant="filled" to='/user/admin'>Admin</NavLink>
                    </div>
                )}
            </div>
            <div className='flex-5'>
                <Outlet />
            </div>
        </div>
    );
}
