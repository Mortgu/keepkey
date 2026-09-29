import { createContext, useContext } from "react";
import { Loader } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { User } from "@keepit/schemas";
import { authClient } from "@/lib/auth-client.ts";
import { useSessionUser } from "@/hooks";

type AuthContextType = {
    user: User | null | undefined;
    isLoading: boolean;
    refetch: () => void;
    logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    refetch: () => { },
    logout: () => { },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

interface Props {
    children: ReactNode;
}

export function AuthProvider({ children }: Props) {
    const navigate = useNavigate();

    const { user = null, isLoading, refetch } = useSessionUser();

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
