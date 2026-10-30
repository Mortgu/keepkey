import { prisma } from "../lib/prismaClient.js";

/* ========== Queries ========== */

export async function getAllPersons() {
    return prisma.person.findMany({
        orderBy: { lastName: "asc" },
    });
}
