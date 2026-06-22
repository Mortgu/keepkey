import {  createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type {ReactNode} from "react";
import type { User } from "@/types";
import { getSessionUser } from "@/data/user.ts";
import { authClient } from "@/lib/auth-client.ts";

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  refetch: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  refetch: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const { data: user = null, isLoading, refetch, error } = useQuery({
    queryKey: ["session"],
    queryFn: getSessionUser,
    retry: false,
  });

  const logout = async () => {
    await authClient.signOut();
    await navigate({ to: "/login" });
  };

  useEffect(() => {
    if (error) {
      navigate({ to: "/login" });
    }
  }, [error]);

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
