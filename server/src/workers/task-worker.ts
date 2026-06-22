import { Job, Worker } from "bullmq";
import connection from "../lib/redis.js";
import { TaskStatus } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { TaskJobData, taskQueue, taskQueueKey } from "./task-queue.js";
import { prisma } from "../lib/prismaClient.js";
import { runPipeline } from "../pipelines/pipeline.js";
import runOfferPipeline from "../pipelines/offer/pipeline.js";
import runOrderPipeline from "../pipelines/order/pipeline.js";

export { taskQueue, taskQueueKey };

export default function registerTaskWorker() {
    const taskWorker = new Worker<TaskJobData>(taskQueueKey, async (job: Job<TaskJobData>) => {
        const { taskId } = job.data;

        const task = await prisma.task.findUniqueOrThrow({
            where: { id: taskId },
        });

        const document = await prisma.document.findFirstOrThrow({
            where: { taskId: task.id },
        });

        const taskTarget = task.target;

        let pipeline;

        switch (taskTarget) {
            case "OFFER":
                const offerDocument = await prisma.offerDocument.findFirstOrThrow({
                    where: { documentId: document.id },
                });

                const { offerId, version } = offerDocument;

                pipeline = await runOfferPipeline({
                    offerId: offerId,
                    taskId: taskId,
                    documentId: document.id,
                    version: version,

                    docxBuffer: null,
                    pdfBuffer: null,
                });


                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        displayName: pipeline.displayName,
                        status: "GENERATED",
                        path: pipeline.path,
                    }
                })

                break;
            case "ORDER":
                const orderDocument = await prisma.orderDocument.findFirstOrThrow({
                    where: { documentId: document.id },
                });

                const { orderId, version: orderVersion } = orderDocument;

                const orderPipeline = await runOrderPipeline({
                    orderId: orderId,
                    taskId: taskId,
                    documentId: document.id,
                    version: orderVersion,

                    docxBuffer: null,
                    pdfBuffer: null,
                });

                await prisma.document.update({
                    where: { id: document.id },
                    data: {
                        displayName: orderPipeline.displayName,
                        status: "GENERATED",
                        path: orderPipeline.path,
                    },
                });

                break;
            case "RENEWAL":
                break;
            default:
                throw new Error("Undefined target!")
                break;
        }

    }, {
        connection, concurrency: 2
    });

    taskWorker.on("active", async (job: Job<TaskJobData>) => {
        const { taskId } = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: TaskStatus.RUNNING,
                }
            })
        } catch (exception: any) {
            const message = "An error occurred while running task";
            logger.error(exception);
            throw new Error(message);
        }
    });

    taskWorker.on("completed", async (job: Job<TaskJobData>) => {
        const { taskId } = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: TaskStatus.COMPLETED,
                }
            });
        } catch (exception: any) {
            logger.error(exception);
            throw new Error("Something went wrong!");
        }
    })

    taskWorker.on("failed", async (job, error, prev) => {
        if (!job) {
            throw new Error("Something went wrong!");
        }

        const { taskId } = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: TaskStatus.FAILED,
                    error: error.message
                }
            });
        } catch (exception: any) {
            logger.error(exception);
            throw new Error("An error occurred while running task");
        }
    });

    return taskWorker;
}