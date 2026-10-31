import { prisma } from "../lib/prismaClient.js";

/* ========== Queries ========== */

export async function getAllPersons() {
    return prisma.person.findMany({
        orderBy: { lastName: "asc" },
    });
}

export async function getPersonById(id: string) {
    return prisma.person.findUnique({
        where: { id },
    });
}
