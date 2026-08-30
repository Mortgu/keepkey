import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AuthContext } from "./auth-context.ts";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client.ts";
import { api } from "@/lib/api-client.ts";
import type { User } from "better-auth";

interface Props {
    children: ReactNode;
}

export function AuthProvider({ children }: Props) {
    const navigate = useNavigate();

    const { data: user = null, isLoading, refetch } = useQuery({
        queryKey: ["session"],
        queryFn: () => api<User>("/api/users/session", {
            method: "GET"
        }),
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
        <AuthContext.Provider value={{ user, logout, isLoading, refetch }}>
            {children}
        </AuthContext.Provider>
    );
}
