import { Task, TaskTarget } from "@prisma/client";
import { Job, Worker } from "bullmq";
import path from "path";
import env from "../lib/env.js";
import { prisma } from "../lib/prismaClient.js";
import connection from "../lib/redis.js";
import logger from "../middlewares/logger.js";
import invoiceTaskHandler from "./handlers/invoice-handler.js";
import offerTaskHandler from "./handlers/offer-handler.js";
import orderTaskHandler from "./handlers/order-handler.js";
import { TaskJobData, taskQueue, taskQueueKey } from "./task-queue.js";
import { handleTaskFailure, markTaskCompleted, markTaskRunning } from "./task-lifecycle.js";

export { taskQueue, taskQueueKey };

export function createDocumentFiles(documentId: string, displayName: string) {
    const docxBasename = `${documentId}.docx`;
    const pdfBasename = `${documentId}.pdf`;
    const outputPath = env.OUTPUT_DIR;

    return {
        pdf: { filename: path.join(outputPath, pdfBasename), basename: pdfBasename, path: outputPath },
        docx: { filename: path.join(outputPath, docxBasename), basename: docxBasename, path: outputPath },
        displayName,
    };
}

type TaskHandlerFn = (task: Task) => Promise<void>;

const handlers: Partial<Record<TaskTarget, TaskHandlerFn>> = {
    OFFER: offerTaskHandler,
    ORDER: orderTaskHandler,
    INVOICE: invoiceTaskHandler,
}

export default function registerTaskWorker() {
    const taskWorker = new Worker<TaskJobData>(taskQueueKey, async (job: Job<TaskJobData>) => {
        const { taskId } = job.data;


        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            logger.warn(`[task-worker] Task ${taskId} not found, skipping.`);
            return;
        }

        const handler = handlers[task.target];

        if (!handler) {
            logger.error(`[task-worker] Something went wrong! Handler for target ${task.target} is not defined!`)
            return;
        }

        await markTaskRunning(taskId);

        await handler(task);

    }, { connection, concurrency: env.WORKER_CONCURRENCY });

    taskWorker.on("completed", async (job: Job<TaskJobData>) => {
        const { taskId } = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await markTaskCompleted(taskId);
        } catch (exception: unknown) {
            logger.error(exception);
        }
    })

    taskWorker.on("failed", async (job, error) => {
        try {
            await handleTaskFailure(job, error);
        } catch (exception: unknown) {
            logger.error(exception);
        }
    });

    return taskWorker;
}
