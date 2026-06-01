import {Worker} from "bullmq";
import {connection, documentQueueKey} from "../lib/queues.js";
import {prisma} from "../lib/prisma.js";
import {generateOfferDocument} from "../pipelines/offer/pipeline.js";
import {TaskStatus, TaskTarget} from "@prisma/client";
import {generateOrderDocument} from "../pipelines/order/pipeline.js";

interface TaskData {
    taskId: string;
    taskTarget: TaskTarget;
    offerId?: string;
    orderId?: string;
}

export default function startDocumentWorker() {
    const worker = new Worker<TaskData>(documentQueueKey, async (job) => {
            const {taskId, taskTarget, offerId, orderId} = job.data;

            // Document is linked directly to the task via taskId
            const document = await prisma.document.findUnique({
                where: {taskId},
                select: {id: true, version: true},
            });

            if (!document) {
                throw new Error(`No document found for task ${taskId}`);
            }

            await prisma.document.update({
                where: {id: document.id},
                data: {status: "PROCESSING"},
            });

            switch (taskTarget) {
                case TaskTarget.OFFER: {
                    if (!offerId) throw new Error("Document job for offer missing offerId in job data");

                    const {displayName} = await generateOfferDocument(
                        offerId,
                        taskId,
                        document.id,
                        document.version,
                    );

                    await prisma.document.update({
                        where: {id: document.id},
                        data: {displayName, pdfReady: true, docxReady: true, status: "GENERATED"},
                    });
                    break;
                }
                case TaskTarget.ORDER: {
                    if (!orderId) throw new Error("Document job for order missing orderId in job data");

                    const {displayName} = await generateOrderDocument(
                        orderId,
                        taskId,
                        document.id,
                        document.version,
                    );

                    await prisma.document.update({
                        where: {id: document.id},
                        data: {displayName, pdfReady: true, docxReady: true, status: "GENERATED"},
                    });
                    break;
                }
                default:
                    throw new Error(`Task ${taskId} has unknown target: ${taskTarget}`);
            }

            await prisma.task.update({
                where: {id: taskId},
                data: {status: TaskStatus.COMPLETED},
            });
        },
        {connection, concurrency: 2},
    );

    worker.on("completed", (job) => {
        if (job) {
            console.log(`[worker] job ${job.id} completed (taskId: ${job.data.taskId})`);
        }
    });

    worker.on("failed", async (job, err) => {
        console.error(`[worker] job ${job?.id} failed:`, err.message);
        if (job) {
            await prisma.task.updateMany({
                where: {id: job.data.taskId},
                data: {status: TaskStatus.FAILED, error: err.message},
            });
        }
    });

    worker.on("stalled", (jobId) => {
        console.warn(`[worker] job ${jobId} stalled`);
    });

    return worker;
}
