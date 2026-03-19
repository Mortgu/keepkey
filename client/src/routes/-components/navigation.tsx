import { NavLink } from "./nav-link";
import { useSession, type authClient } from "@/lib/auth-client";

import {Home, Info, Loader} from 'lucide-react';
import UserMenu from "./user-menu";
import { useEffect } from "react";

export default function Navigation() {
    const { data: session, isPending, error } = useSession();



    console.log(session);

    return (
        <div className="h-18 w-full bg-gray-100">
            <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
                <div className="flex gap-2">
                    <NavLink to="/"><Home className='size-4' /> Startseite</NavLink>
                    <NavLink to="/about"><Info className='size-4' /> About</NavLink>
                </div>
                <div className="flex">
                    {(isPending || error) ? (<Loader className="animate-spin" />) : (
                        <>
                            {(!session || !session.user) ? (
                                <NavLink to="/login">Login</NavLink>
                            ) : (
                                <UserMenu session={session} />
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}