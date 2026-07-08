import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";

/* ========== Queries ========== */

export async function getAllTasks() {
    return prisma.task.findMany();
}

export async function getTaskById(id: string) {
    if (!id) {
        throw new AppException("Bad request!", 400, "MISSING_ID");
    }

    return prisma.task.findUnique({
        where: { id },
    });
}
