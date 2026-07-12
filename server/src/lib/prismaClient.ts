import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client";
import env from "./env.js";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
});

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    omit: {
        task: { runToken: true },
        offerDocument: { uploadToken: true },
        orderDocument: { uploadToken: true },
    },
    log: env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error']
}) as unknown as PrismaClient;

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
