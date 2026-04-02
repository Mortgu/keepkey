import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NavLink } from "@/routes/-components/nav-link.tsx";
import { Car, MoveRight, Settings } from "lucide-react";
import { useAuth } from '@/context/auth';

export const Route = createFileRoute('/user/_pathlessLayout')({
    component: PathlessLayoutComponent,
})

async function PathlessLayoutComponent() {
    const { user } = useAuth();

    if (!user) {
        return window.location.assign('/login');
    }

    return (
        <div className='grid gap-4'>
            <div className='w-full h-14 border-b bg-gray-100 border-gray-200'>
                <div className='flex items-center justify-between w-full max-w-(--viewport) m-auto h-full px-4'>
                    <div className='flex items-center gap-8 h-full'>
                        <NavLink className='flex items-center gap-2' to='/user/settings'>
                            <Settings className="size-4" />
                            Settings
                        </NavLink>
                        <NavLink className='flex items-center gap-2' to='/user/orders'>
                            <Car className="size-4" />
                            My Orders
                        </NavLink>
                    </div>
                    <div className='flex items-center gap-8 h-full'>
                        {user.role === 'admin' && (
                            <NavLink className='flex items-center gap-2' to='/admin'>
                                Dashboard
                                <MoveRight className="size-4" />
                            </NavLink>
                        )}
                    </div>
                </div>

                <div className='max-w-(--viewport) m-auto h-full p-4'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
