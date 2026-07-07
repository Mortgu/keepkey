import { prisma } from "../lib/prismaClient.js";
import type { Task } from "@prisma/client";
import { AppException } from "../lib/exceptions.js";

/* ========== Queries ========== */

export async function getAllTasks(): Promise<Task[]> {
    return prisma.task.findMany();
}

export async function getTaskById(id: string): Promise<Task | null> {
    if (!id) {
        throw new AppException("Bad request!", 400, "MISSING_ID");
    }

    return prisma.task.findUnique({
        where: { id },
    });
}
