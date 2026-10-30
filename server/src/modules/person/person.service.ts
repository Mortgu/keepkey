/* ========== Get Queries ========== */

import { prisma } from "@/lib/prismaClient.js";

export const getAllPersons = async () => {
    return prisma.person.findMany({});
}

export const getPerson = async (id: string) => {
    return prisma.person.findUnique({
        where: { id }
    });
}