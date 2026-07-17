import { DocumentStatus, TaskStatus } from "@prisma/client";
import type { Job } from "bullmq";
import { prisma } from "../lib/prismaClient.js";
import logger from "../middlewares/logger.js";
import type { TaskJobData } from "./task-queue.js";

export async function markTaskRunning(
    taskId: string,
    runToken: string,
): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const claimed = await tx.task.updateMany({
            where: {
                id: taskId,
                status: { in: [TaskStatus.PENDING, TaskStatus.RUNNING, TaskStatus.FAILED] },
            },
            data: {
                status: TaskStatus.RUNNING,
                error: null,
                runToken,
            },
        });

        if (claimed.count !== 1) return false;

        await tx.offerDocument.updateMany({
            where: {
                taskId,
                status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                artifacts: { none: {} },
            },
            data: { status: DocumentStatus.PROCESSING, error: null },
        });
        await tx.orderDocument.updateMany({
            where: {
                taskId,
                status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                artifacts: { none: {} },
            },
            data: { status: DocumentStatus.PROCESSING, error: null },
        });

        return true;
    });
}

export async function markTaskCompleted(taskId: string, runToken: string): Promise<void> {
    const completed = await prisma.task.updateMany({
        where: { id: taskId, status: TaskStatus.RUNNING, runToken },
        data: { status: TaskStatus.COMPLETED, error: null, runToken: null },
    });

    if (completed.count !== 1) {
        throw new Error(`Task ${taskId} is no longer owned by this worker attempt.`);
    }
}

export async function releaseTaskRun(taskId: string, runToken: string): Promise<void> {
    await prisma.task.updateMany({
        where: { id: taskId, status: TaskStatus.RUNNING, runToken },
        data: { runToken: null },
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

    await prisma.$transaction(async (tx) => {
        const failed = await tx.task.updateMany({
            where: {
                id: taskId,
                status: { in: [TaskStatus.RUNNING, TaskStatus.FAILED] },
                runToken: null,
            },
            data: { status: TaskStatus.FAILED, error: error.message, runToken: null },
        });

        if (failed.count !== 1) return;

        await tx.offerDocument.updateMany({
            where: {
                taskId,
                status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                artifacts: { none: {} },
            },
            data: { status: DocumentStatus.FAILED, error: error.message },
        });
        await tx.orderDocument.updateMany({
            where: {
                taskId,
                status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                artifacts: { none: {} },
            },
            data: { status: DocumentStatus.FAILED, error: error.message },
        });
    });
}
