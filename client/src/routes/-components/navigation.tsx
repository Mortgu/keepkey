import { NavLink } from "./nav-link";
import { useSession, type authClient } from "@/lib/auth-client";

import { Loader } from 'lucide-react';
import UserMenu from "./user-menu";
import { useEffect } from "react";

export default function Navigation() {
    const { data: session, isPending, error, refetch } = useSession();

    useEffect(() => { refetch() }, []);

    console.log(session);

    return (
        <div className="h-18 w-full bg-gray-100">
            <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
                <div className="flex gap-2">
                    <NavLink to="/">Main Page</NavLink>
                    <NavLink to="/about">About Page</NavLink>
                </div>
                <div className="flex">
                    {(isPending || error) ? (<Loader className="animate-spin" />) : (
                        <>
                            {(!session || !session.user) ? (
                                <NavLink to="/login">Login Page</NavLink>
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