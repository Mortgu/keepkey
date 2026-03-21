import {LogOut, Settings, ShoppingBag, User} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {authClient} from "@/lib/auth-client.ts";

type Props = {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export default function UserMenu({ user }: Props) {
    const menuRef = useRef<HTMLDivElement>(null);

    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function signOut() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    setOpen(false);
                }
            }
        });
    }

    return (
        <div className="relative m-auto" ref={menuRef}>
            {/* Avatar */}
            <button onClick={() => setOpen(true)}>
                <div className="flex items-center gap-2 w-full h-full">
                    <div className="w-10 h-10 rounded-lg  hover:text-(--keepit-primary) cursor-pointer transition-all flex items-center justify-center">
                        <User className="size-6" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="flex gap-2 items-center text-sm font-medium text-gray-900">{ user.name } <span className="text-xs bg-gray-200 py-1 px-2 rounded-lg">{ user.role }</span></p>
                        <p className="text-xs text-gray-500 mt-1">{ user.email }</p>
                    </div>

                    <a href="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpen(false)}>
                        <ShoppingBag className="size-4" />
                        Meine Bestellungen
                    </a>

                    <a href="/user/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                       onClick={() => setOpen(false)}>
                        <Settings className="size-4" />
                        Settings
                    </a>

                    <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="size-4" />
                        Abmelden
                    </button>
                </div>
            )}
        </div>
    )
}