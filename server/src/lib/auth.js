import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:5173"],
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),

    emailAndPassword: {
        enabled: true,
    },
});