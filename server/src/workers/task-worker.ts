import { TaskStatus } from "@prisma/client";
import { Job, Worker } from "bullmq";
import type { Redis } from "ioredis";
import env from "../lib/env.js";
import { prisma } from "@/lib/prismaClient.js";
import logger from "@/utils/logger.js";
import { documentTypeForTarget } from "@/services/document/document-types.js";
import { runGeneration } from "@/services/document/document-generation.js";
import { type TaskJobData, taskQueueKey } from "./task-contract.js";
import {
    handleTaskFailure,
    markTaskCompleted,
    markTaskRunning,
    releaseTaskRun,
} from "./task-lifecycle.js";

export default function registerTaskWorker(connection: Redis) {
    const taskWorker = new Worker<TaskJobData>(taskQueueKey, async (job: Job<TaskJobData>, token?: string) => {
        const { taskId } = job.data;

        if (!token) {
            throw new Error(`BullMQ did not provide a lock token for task ${taskId}.`);
        }


        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            logger.warn('task_worker_skipped', { taskId });
            return;
        }

        if (!documentTypeForTarget(task.target)) {
            logger.error('task_worker_no_handler', { taskId, target: task.target });
            return;
        }

        const claimed = await markTaskRunning(taskId, token, task.target);
        if (!claimed) {
            if (task.status === TaskStatus.COMPLETED) return;
            throw new Error(`Task ${taskId} could not be claimed.`);
        }

        try {
            await runGeneration(task.id);
            await markTaskCompleted(taskId, token);
        } catch (error) {
            try {
                await releaseTaskRun(taskId, token);
            } catch (releaseError) {
                logger.error(releaseError);
            }
            throw error;
        }

    }, { connection, concurrency: env.WORKER_CONCURRENCY });

    // Ohne Listener würde BullMQ ein "error"-Event als uncaughtException werfen.
    taskWorker.on("error", (error) => {
        logger.warn('task_worker_redis_error', { error: error.message });
    });

    taskWorker.on("failed", async (job, error) => {
        try {
            await handleTaskFailure(job, error);
        } catch (exception: unknown) {
            logger.error(exception);
        }
    });

    return taskWorker;
}
