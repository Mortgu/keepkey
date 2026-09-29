import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/context/auth";
import { useBlockFileDrop } from "@/hooks";

export function RootComponent() {
    useBlockFileDrop();

    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
