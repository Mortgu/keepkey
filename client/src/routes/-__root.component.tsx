import { AuthProvider } from "@/context/auth.tsx";
import { Outlet } from "@tanstack/react-router";

export function RootComponent() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
