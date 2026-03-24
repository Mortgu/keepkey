import {redirect} from "@tanstack/react-router";

export async function requireSession(context: any) {
    const { data: session } = await context.auth.getSession();

    if (!session) {
        throw redirect({
            to: '/login',
            search: { redirect: window.location.href }
        })
    }

    return session;
}