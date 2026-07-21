import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { passkey } from "@better-auth/passkey";

import env from "./env.js";
import { prisma } from "./prismaClient.js";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.CORS_ORIGIN ?? "http://localhost:5173"],
    advanced: {
        defaultCookieAttributes: {
            secure: true,
            httpOnly: true,
            sameSite: "none",
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        changeEmail: {
            enabled: true,
        },
        additionalFields: {
            salutation: {
                type: "string",
                required: true,
            },
            firstName: {
                type: "string",
                required: true,
            },
            lastName: {
                type: "string",
                required: true,
            },
            phone: {
                type: "string",
                required: false,
            },
        },
    },
    plugins: [
        passkey(),
    ],
});
