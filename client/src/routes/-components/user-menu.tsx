import { useSession } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function UserMenu({ session }: { session: any }) {
    const router = useRouter();
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


    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar */}
            <button onClick={() => setOpen(true)}>
                <div className="flex items-center gap-2 w-full h-full">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-(--keepit-primary) text-(--keepit-primary) hover:text-white transition-all flex items-center justify-center">
                        <User className="size-6" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{ }</p>
                            <p className="text-xs text-gray-500 mt-1">{ }</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}