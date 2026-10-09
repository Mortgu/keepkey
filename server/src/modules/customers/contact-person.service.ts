import { prisma } from "@/core/prisma.js";

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
