import { prisma } from "../lib/prismaClient.js";

/* ========== Queries ========== */

export async function getAllContactPersons() {
    return prisma.contactPerson.findMany({
        include: {
            customer: true,
        },
        orderBy: {
            lastName: "asc",
        },
    });
}
