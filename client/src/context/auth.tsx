import { createContext, type ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/data/user.ts";
import { Loader } from "lucide-react";
import { authClient } from "@/lib/auth-client.ts";
import type { User } from "@/data/types";

type AuthContextType = {
    user: User | null | undefined,
    isLoading: boolean,
    refetch: () => void,
    logout: () => void,
}

const AuthContext = createContext<AuthContextType>({
    user: null, isLoading: false, refetch: () => { }, logout: () => { },
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user = null, isLoading, refetch } = useQuery({
        queryKey: ['session'],
        queryFn: getCurrentUser
    });

    if (isLoading) {
        return (
            <div><Loader className='animate-spin' /></div>
        )
    }

    const logout = async () => {
        await authClient.signOut();
        throw window.location.reload();
    }

    return (
        <AuthContext.Provider value={{ user: user ? user[0] : null, logout, isLoading, refetch }}>
            {children}
        </AuthContext.Provider>
    )
}
