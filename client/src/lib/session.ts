import { useSession } from '@tanstack/react-start/server';

type SessionData = {
    userId?: string,
    name?: string,
    email?: string,
    role?: string,
}

export function useAppSession() {
    return useSession<SessionData>({
        name: 'app-session',
        password: "",
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true,
        }
    });
}