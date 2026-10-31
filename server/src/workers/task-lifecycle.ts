import { DocumentStatus, TaskStatus, type TaskTarget } from "@prisma/client";
import type { Job } from "bullmq";
import { prisma } from "@/lib/prismaClient.js";
import logger from "@/utils/logger.js";
import { documentTable } from "@/services/document/document-repo.js";
import type { TaskJobData } from "./task-contract.js";

/** Nur diese vier `TaskTarget`-Werte haben überhaupt eine Dokumenttabelle; `RENEWAL` nie. */
const DOCUMENT_TYPE_BY_TARGET = {
    OFFER: "offer",
    ORDER: "order",
    CONFIRMATION: "confirmation",
    INVOICE: "invoice",
} as const satisfies Partial<Record<TaskTarget, string>>;

export async function markTaskRunning(taskId: string, runToken: string, target: TaskTarget): Promise<boolean> {
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

        // Ein Task gehört immer zu genau einem Zieltyp — nur dessen Tabelle anfassen.
        const type = DOCUMENT_TYPE_BY_TARGET[target as keyof typeof DOCUMENT_TYPE_BY_TARGET];
        if (type) {
            await documentTable(type, tx).updateMany(
                {
                    taskId,
                    status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                    artifacts: { none: {} },
                },
                { status: DocumentStatus.PROCESSING, error: null },
            );
        }

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

export async function handleTaskFailure(job: Job<TaskJobData> | undefined, error: Error): Promise<void> {
    if (!job) {
        logger.error('task_worker', { error: 'missing_job' });
        return;
    }

    const { taskId } = job.data;

    if (job.finishedOn === undefined) {
        logger.warn('task_worker_failed_retry', {
            taskId,
            attemptsMade: job.attemptsMade,
            maxAttempts: job.opts.attempts ?? 1,
            error: error.message,
        });
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

        const current = await tx.task.findUnique({ where: { id: taskId }, select: { target: true } });
        const type = current && DOCUMENT_TYPE_BY_TARGET[current.target as keyof typeof DOCUMENT_TYPE_BY_TARGET];
        if (type) {
            await documentTable(type, tx).updateMany(
                {
                    taskId,
                    status: { in: [DocumentStatus.PENDING, DocumentStatus.PROCESSING, DocumentStatus.FAILED] },
                    artifacts: { none: {} },
                },
                { status: DocumentStatus.FAILED, error: error.message },
            );
        }
    });
}