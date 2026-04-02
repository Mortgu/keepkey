import { createContext, type ReactNode, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAccountAction, getCurrentUser } from "@/data/user.ts";
import { Loader } from "lucide-react";
import { authClient } from "@/lib/auth-client.ts";
import type { User } from "@/data/types";

type AuthContextType = {
    user: User | null | undefined,
    isLoading: boolean,
    refetch: () => void,
    logout: () => void,
    deleteAccount: () => void,
}

const AuthContext = createContext<AuthContextType>({
    user: null, isLoading: false, refetch: () => { }, logout: () => { }, deleteAccount: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user = null, isLoading, refetch } = useQuery({
        queryKey: ['session'],
        queryFn: getCurrentUser
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccountAction,
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['session'],
        }),
    })


    const logout = async () => {
        await authClient.signOut();
        throw window.location.reload();
    }


    if (isLoading) {
        return (
            <div><Loader className='animate-spin' /></div>
        )
    }

    return (
        <AuthContext.Provider value={{ user: user ? user[0] : null, logout, isLoading, refetch, deleteAccount: deleteAccountMutation.mutate }}>
            {children}
        </AuthContext.Provider>
    )
}
