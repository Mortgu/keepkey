import { prisma } from "@/core/prisma.js";
import { AppException } from "@/core/exceptions.js";

const publicTaskOmit = { runToken: true } as const;

/* ========== Queries ========== */

export async function getAllTasks() {
    return prisma.task.findMany({ omit: publicTaskOmit });
}

export async function getTaskById(id: string) {
    if (!id) {
        throw new AppException("Bad request!", 400, "MISSING_ID");
    }

    return prisma.task.findUnique({
        where: { id },
        omit: publicTaskOmit,
    });
}
