import { NavLink } from "./nav-link";

import { Loader, User } from 'lucide-react';
import { authClient } from "@/lib/auth-client.ts";
import { SearchBar, SingleDropdown } from "@/components/filters";
import { useState } from "react";

const SingleDropdownOptions = [
    { value: "generated", label: "Generated", dot: "var(--primary)" }
]

export default function Navigation() {
    const [search, setSearch] = useState<string>("");
    const [selected, setSelected] = useState<string>("");

    const { data: session, isPending, error } = authClient.useSession();

    return (
        <div className="h-18 w-full border-b border-(--border) bg-white">
            <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
                <div className="flex h-full gap-8">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/products">Products</NavLink>
                </div>
                <div className="flex gap-2">
                    <SearchBar value={search} onChange={setSearch} placeholder="Suchen..." />
                </div>
                <div className="flex h-full">
                    {isPending ? <Loader className="animate-spin" /> :
                        error ? "Error" : session ? (
                            <NavigationActions />
                        ) : (
                            <div className='flex items-center gap-2'>
                                <NavLink to="/login">Login</NavLink>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

function NavigationActions() {
    return (
        <div className='flex gap-4'>
            {/*<div className='w-8 h-8 m-auto'>
                <button className='bg-(--primary) cursor-pointer w-full h-full rounded-lg flex items-center justify-center'>
                    <Plus className='size-5 text-white' />
                </button>
            </div>*/}

            <div className='w-8 h-full m-auto hover:text-(--primary) cursor-pointer'>
                <NavLink to="/user/settings">
                    <User className='size-6' />
                </NavLink>
            </div>
        </div>
    )
}