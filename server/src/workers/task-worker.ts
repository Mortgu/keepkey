import { Job, Worker } from "bullmq";
import connection from "../lib/redis.js";
import { TaskStatus } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { TaskJobData, taskQueue, taskQueueKey } from "./task-queue.js";
import { prisma } from "../lib/prismaClient.js";
import { runPipeline } from "../pipelines/pipeline.js";
import runOfferPipeline from "../pipelines/offer/pipeline.js";
import runOrderPipeline from "../pipelines/order/pipeline.js";
import path from "path";
import env from "../lib/env.js";

export { taskQueue, taskQueueKey };

function createDocumentFiles(documentId: string, displayName: string) {
    const docxBasename = `${documentId}.docx`;
    const pdfBasename = `${documentId}.pdf`;
    const outputPath = env.OUTPUT_DIR;

    return {
        pdf: { filename: path.join(outputPath, pdfBasename), basename: pdfBasename, path: outputPath },
        docx: { filename: path.join(outputPath, docxBasename), basename: docxBasename, path: outputPath },
        displayName,
    };
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

        const taskTarget = task.target;

        switch (taskTarget) {
            case "OFFER": {
                console.log("====================================")

                const offerDocument = await prisma.offerDocument.findFirst({
                    where: { taskId: task.id },
                });

                console.log("offerDocument", offerDocument)

                if (!offerDocument) {
                    logger.warn(`[task-worker] OfferDocument for task ${taskId} not found, skipping.`);
                    return;
                }

                const { offerId, id: documentId, version } = offerDocument;

                const pipeline = await runOfferPipeline({
                    offerId,
                    taskId,
                    documentId,
                    version,
                    docxBuffer: null,
                    pdfBuffer: null,
                });

                console.log("pipeline", pipeline);


                const files = createDocumentFiles(documentId, pipeline.displayName ?? documentId);

                console.log("files", files);


                const pdf = await prisma.document.create({
                    data: {
                        filename: files.pdf.filename,
                        basename: files.pdf.basename,
                        path: files.pdf.path,
                        format: "PDF",
                        size: pipeline.pdfBuffer?.length ?? null,
                    },
                });

                console.log("pdf", pdf);

                const docx = await prisma.document.create({
                    data: {
                        filename: files.docx.filename,
                        basename: files.docx.basename,
                        path: files.docx.path,
                        format: "DOCX",
                        size: pipeline.docxBuffer?.length ?? null,
                    },
                });
                console.log("docx", docx);


                await prisma.offerDocument.update({
                    where: { id: offerDocument.id },
                    data: {
                        pdfId: pdf.id,
                        docxId: docx.id,
                        status: "GENERATED",
                        displayName: files.displayName,
                    },
                });

                break;
            }
            case "ORDER": {
                const orderDocument = await prisma.orderDocument.findFirst({
                    where: { taskId: task.id },
                });

                if (!orderDocument) {
                    logger.warn(`[task-worker] OrderDocument for task ${taskId} not found, skipping.`);
                    return;
                }

                const { orderId, id: documentId, version } = orderDocument;

                const pipeline = await runOrderPipeline({
                    orderId,
                    taskId,
                    documentId,
                    version,
                    docxBuffer: null,
                    pdfBuffer: null,
                });

                const files = createDocumentFiles(documentId, pipeline.displayName ?? documentId);

                const pdf = await prisma.document.create({
                    data: {
                        filename: files.pdf.filename,
                        basename: files.pdf.basename,
                        path: files.pdf.path,
                        format: "PDF",
                        size: pipeline.pdfBuffer?.length ?? null,
                    },
                });

                const docx = await prisma.document.create({
                    data: {
                        filename: files.docx.filename,
                        basename: files.docx.basename,
                        path: files.docx.path,
                        format: "DOCX",
                        size: pipeline.docxBuffer?.length ?? null,
                    },
                });

                await prisma.orderDocument.update({
                    where: { id: orderDocument.id },
                    data: {
                        pdfId: pdf.id,
                        docxId: docx.id,
                        status: "GENERATED",
                        displayName: files.displayName,
                    },
                });

                break;
            }
            case "RENEWAL":
                break;
            default:
                throw new Error("Undefined target!");
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

            await prisma.offerDocument.updateMany({
                where: { taskId },
                data: { status: "FAILED", error: error.message },
            });

            await prisma.orderDocument.updateMany({
                where: { taskId },
                data: { status: "FAILED", error: error.message },
            });
        } catch (exception: any) {
            logger.error(exception);
            throw new Error("An error occurred while running task");
        }
    });

    return taskWorker;
}
