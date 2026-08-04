import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/context/auth.tsx";

export function RootComponent() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
