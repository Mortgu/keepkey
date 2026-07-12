import { DocumentStatus, TaskStatus } from "@prisma/client";
import type { Job } from "bullmq";
import { prisma } from "../lib/prismaClient.js";
import logger from "../middlewares/logger.js";
import type { TaskJobData } from "./task-queue.js";

export async function markTaskRunning(taskId: string): Promise<void> {
    await prisma.$transaction([
        prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.RUNNING, error: null },
        }),
        prisma.offerDocument.updateMany({
            where: { taskId },
            data: { status: DocumentStatus.PROCESSING, error: null },
        }),
        prisma.orderDocument.updateMany({
            where: { taskId },
            data: { status: DocumentStatus.PROCESSING, error: null },
        }),
    ]);
}

export async function markTaskCompleted(taskId: string): Promise<void> {
    await prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.COMPLETED, error: null },
    });
}

export async function handleTaskFailure(
    job: Job<TaskJobData> | undefined,
    error: Error,
): Promise<void> {
    if (!job) {
        logger.error("[task-worker] Failed job is missing.");
        return;
    }

    const { taskId } = job.data;

    if (job.finishedOn === undefined) {
        logger.warn(
            `[task-worker] Task ${taskId} attempt ${job.attemptsMade}/${job.opts.attempts ?? 1} failed and will be retried: ${error.message}`,
        );
        return;
    }

    await prisma.$transaction([
        prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.FAILED, error: error.message },
        }),
        prisma.offerDocument.updateMany({
            where: { taskId },
            data: { status: DocumentStatus.FAILED, error: error.message },
        }),
        prisma.orderDocument.updateMany({
            where: { taskId },
            data: { status: DocumentStatus.FAILED, error: error.message },
        }),
    ]);
}
