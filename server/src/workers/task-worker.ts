import { Task, TaskStatus, TaskTarget } from "@prisma/client";
import { Job, Worker } from "bullmq";
import env from "../lib/env.js";
import { prisma } from "../lib/prismaClient.js";
import connection from "../lib/redis.js";
import logger from "../middlewares/logger.js";
import invoiceTaskHandler from "./handlers/invoice-handler.js";
import offerTaskHandler from "./handlers/offer-handler.js";
import orderTaskHandler from "./handlers/order-handler.js";
import { TaskJobData, taskQueue, taskQueueKey } from "./task-queue.js";
import {
    handleTaskFailure,
    markTaskCompleted,
    markTaskRunning,
    releaseTaskRun,
} from "./task-lifecycle.js";

export { taskQueue, taskQueueKey };

type TaskHandlerFn = (task: Task) => Promise<void>;

const handlers: Partial<Record<TaskTarget, TaskHandlerFn>> = {
    OFFER: offerTaskHandler,
    ORDER: orderTaskHandler,
    INVOICE: invoiceTaskHandler,
}

export default function registerTaskWorker() {
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

        const handler = handlers[task.target];

        if (!handler) {
            logger.error('task_worker_no_handler', { taskId, target: task.target });
            return;
        }

        const claimed = await markTaskRunning(taskId, token);
        if (!claimed) {
            if (task.status === TaskStatus.COMPLETED) return;
            throw new Error(`Task ${taskId} could not be claimed.`);
        }

        try {
            await handler(task);
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

    taskWorker.on("failed", async (job, error) => {
        try {
            await handleTaskFailure(job, error);
        } catch (exception: unknown) {
            logger.error(exception);
        }
    });

    return taskWorker;
}
