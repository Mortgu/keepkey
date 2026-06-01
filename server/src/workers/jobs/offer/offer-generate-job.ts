import logger from "../../../middlewares/logger.js";
import {prisma} from "../../../lib/prismaClient.js";
import {Task, TaskStatus, TaskTarget, TaskType} from "@prisma/client";
import runOfferPipeline from "../../../pipelines/offer/pipeline.js";
import {taskQueue, taskQueueKey} from "../../task-queue.js";

export async function offerGenerateJob(task: Task) {
    logger.info("Task for generating a offer document")

    const document = await prisma.document.findUnique({
        where: {taskId: task.id},
    });

    if (!document) {
        throw new Error("Document not found!");
    }

    const offer = await prisma.offer.findUnique({
        where: {id: document.offerId as string},
    });

    if (!offer) {
        throw new Error("Offer not found!");
    }

    const pipeline = await runOfferPipeline({
        offerId: offer.id,
        taskId: task.id,
        documentId: document.id,
        version: document.version
    });

    await prisma.document.update({
        where: {id: document.id},
        data: {
            displayName: pipeline.displayName,
            pdfReady: true,
            docxReady: true,
            status: "GENERATED"
        }
    })
}

export async function enqueueOfferGeneration(offerId: string) {
    const task = await prisma.task.create({
        data: {
            status: TaskStatus.PENDING,
            target: TaskTarget.OFFER,
            type: TaskType.GENERATION,
        },
    });

    await prisma.$transaction(async (tx) => {
        await tx.document.updateMany({
            where: {offerId, isCurrent: true},
            data: {isCurrent: false},
        });

        const latest = await tx.document.findFirst({
            where: {offerId},
            orderBy: {version: "desc"},
            select: {version: true},
        });

        await tx.document.create({
            data: {
                offerId,
                taskId: task.id,
                version: (latest?.version ?? 0) + 1,
                status: "PENDING",
                isCurrent: true,
            },
        });
    });

    const job = await taskQueue.add(taskQueueKey, {taskId: task.id});
    await prisma.task.update({where: {id: task.id}, data: {jobId: job.id}});
    return task;
}