import { createContext, useContext } from "react";
import type { User } from "@keepit/schemas";

type AuthContextType = {
    user: User | null | undefined;
    isLoading: boolean;
    refetch: () => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    refetch: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);
