import { prisma } from "../lib/prismaClient.js";

/* ========== Queries ========== */

export async function getAllContactPersons() {
    return prisma.person.findMany({
        include: {
            customer: true,
        },
        orderBy: {
            lastName: "asc",
        },
    });
}
