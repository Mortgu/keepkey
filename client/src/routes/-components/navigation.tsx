import {NavLink} from "./nav-link";

import {Loader, ShoppingBag} from 'lucide-react';
import UserMenu from "./user-menu";
import {authClient} from "@/lib/auth-client.ts";
import ShoppingCart from "@/components/shopping-cart.tsx";
import {Link} from "@tanstack/react-router";

export default function Navigation() {
    const {data: session, isPending, error} = authClient.useSession();

    return (
        <div className="h-18 w-full border-b border-gray-200">
            <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
                <div className="flex h-full gap-6">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/products">Products</NavLink>
                </div>
                <div className="flex h-full">
                    {isPending ? <Loader className="animate-spin" /> :
                    error ? "Error" : session ? (
                        <div className='flex gap-4'>
                            <UserMenu user={session.user} />
                            <div className='m-auto'>
                                <Link to="/checkout">
                                    <ShoppingBag className="size-6"/>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <NavLink to="/login">Login</NavLink>
                    )}
                </div>
            </div>
        </div>
    )
}