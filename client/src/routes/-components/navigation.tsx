import {NavLink} from "./nav-link";

import {Loader, Plus, ShoppingBag, User} from 'lucide-react';
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
                        <NavigationActions />
                    ) : (
                        <NavLink to="/login">Login</NavLink>
                    )}
                </div>
            </div>
        </div>
    )
}

function NavigationActions() {
    return (
        <div className='flex gap-4'>
            <div className='w-8 h-8 m-auto'>
                <button className='bg-(--keepit-primary) cursor-pointer w-full h-full rounded-lg flex items-center justify-center'>
                    <Plus className='size-5 text-white' />
                </button>
            </div>

            <div className='w-8 h-full m-auto hover:text-(--keepit-primary) cursor-pointer'>
                <NavLink to="/user">
                    <User className='size-6' />
                </NavLink>
            </div>

            <div className='w-8 h-full m-auto'>
                <div className='h-full m-auto hover:text-(--keepit-primary) cursor-pointer'>
                    <NavLink to="/checkout">
                        <ShoppingBag className="size-6"/>
                    </NavLink>
                </div>
            </div>

        </div>
    )
}