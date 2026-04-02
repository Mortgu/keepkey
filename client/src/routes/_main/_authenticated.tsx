import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router'
import { authClient } from "@/lib/auth-client.ts";

export const Route = createFileRoute('/_main/_authenticated')({
    beforeLoad: async ({ location }) => {
        const { data: session } = await authClient.getSession();

        try {
            if (!session || !session.user) {
                throw redirect({
                    to: '/login',
                    search: { redirect: location.href },
                })
            }
            return { user: session.user };
        } catch (error) {
            // Re-throw redirects (they're intentional, not errors)
            if (isRedirect(error)) throw error

            // Auth check failed (network error, etc.) - redirect to login
            throw redirect({
                to: '/login',
                search: { redirect: location.href },
            })
        }
    },
});
