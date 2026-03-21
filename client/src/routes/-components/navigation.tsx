import {NavLink} from "./nav-link";

import {Loader} from 'lucide-react';
import UserMenu from "./user-menu";
import {authClient} from "@/lib/auth-client.ts";

export default function Navigation() {
    const { data: session, isPending, error } = authClient.useSession();


    return (
        <div className="h-18 w-full border-b border-gray-200">
            <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
                <div className="flex h-full">
                    <NavLink to="/">Startseite</NavLink>
                    <NavLink to="/about">About</NavLink>
                </div>
                <div className="flex">
                    {(isPending || error) ? (<Loader className="animate-spin" />) : (
                        <>
                            {(!session || !session.user) ? (
                                <NavLink to="/login">Login</NavLink>
                            ) : (
                                <UserMenu user={session.user} />
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}