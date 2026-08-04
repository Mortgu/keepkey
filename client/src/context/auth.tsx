import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AuthContext } from "./auth-context.ts";
import type { ReactNode } from "react";
import { getSessionUser } from "@/data/user.ts";
import { authClient } from "@/lib/auth-client.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    const { data: user = null, isLoading, refetch } = useQuery({
        queryKey: ["session"],
        queryFn: getSessionUser,
        retry: false,
    });

    const logout = async () => {
        await authClient.signOut();
        await navigate({ to: "/login" });
    };

    if (isLoading) {
        return (
            <div>
                <Loader className="animate-spin" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user: user ? user : null, logout, isLoading, refetch }}>
            {children}
        </AuthContext.Provider>
    );
}
