import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js';
import { admin as adminPlugin } from 'better-auth/plugins';

import { ac, admin, user } from './permissions.js';

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:5173"],
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
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
            }
        }
    },
    plugins: [
        adminPlugin({
            ac,
            roles: {
                admin,
                user
            }
        }),
    ]
});
