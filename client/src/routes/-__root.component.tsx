import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/context/auth.tsx";
import { useBlockFileDrop } from "@/hooks";

export function RootComponent() {
    useBlockFileDrop();

    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
