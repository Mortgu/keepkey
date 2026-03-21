import {createContext, type ReactNode, useContext} from "react";
import {useQuery} from "@tanstack/react-query";
import {getCurrentUser} from "@/data/user.ts";
import {Loader} from "lucide-react";

type User = {
    id: string,
    name: string,
    email: string,
    role: string
}

type AuthContextType = {
    user: User | null | undefined,
    isLoading: boolean,
    refetch: () => void,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: user, isLoading, refetch } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser
    });

    if (isLoading) {
        return (
            <div><Loader className='animate-spin' /></div>
        )
    }

    return (
        <AuthContext.Provider value={{ user: user[0], isLoading, refetch }}>
            {children}
        </AuthContext.Provider>
    )
}
