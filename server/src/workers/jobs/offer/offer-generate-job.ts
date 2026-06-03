import path from "path";
import logger from "../../../middlewares/logger.js";
import {prisma} from "../../../lib/prismaClient.js";
import {DocumentFormat, Task, TaskStatus, TaskTarget, TaskType} from "@prisma/client";
import runOfferPipeline from "../../../pipelines/offer/pipeline.js";
import {taskQueue, taskQueueKey} from "../../task-queue.js";
import env from "../../../lib/env.js";

export async function offerGenerateJob(task: Task) {
    logger.info("Task for generating an offer document");

    const document = await prisma.document.findUnique({
        where: {taskId: task.id},
        include: {
            offerDocument: true,
        },
    });

    if (!document || !document.offerDocument) {
        throw new Error("Document or OfferDocument not found for task!");
    }

    const offerDoc = document.offerDocument;
    const {offerId, version} = offerDoc;

    const offer = await prisma.offer.findUnique({where: {id: offerId}});
    if (!offer) {
        throw new Error("Offer not found!");
    }

    const {displayName} = await runOfferPipeline({
        offerId: offer.id,
        taskId: task.id,
        documentId: document.id,
        version,
    });

    // The pipeline writes files named after the DOCX document's id
    const docxLocalPath = path.join(env.OUTPUT_DIR, `${document.id}.docx`);
    const pdfLocalPath = path.join(env.OUTPUT_DIR, `${document.id}.pdf`);

    await prisma.$transaction(async (tx) => {
        // Update the DOCX document
        await tx.document.update({
            where: {id: document.id},
            data: {status: "GENERATED", path: docxLocalPath, displayName},
        });

        // Find the PDF document for this offer+version (created during reservation)
        const existingPdfOfferDoc = await tx.offerDocument.findFirst({
            where: {
                offerId,
                version,
                document: {format: DocumentFormat.PDF},
            },
            select: {documentId: true},
        });

        if (existingPdfOfferDoc) {
            await tx.document.update({
                where: {id: existingPdfOfferDoc.documentId},
                data: {status: "GENERATED", path: pdfLocalPath, displayName},
            });
        } else {
            const pdfDoc = await tx.document.create({
                data: {format: "PDF", status: "GENERATED", path: pdfLocalPath, displayName},
            });
            await tx.offerDocument.create({
                data: {offerId, documentId: pdfDoc.id, version, isCurrent: true},
            });
        }
    });
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
        // Mark existing current DOCX OfferDocuments as not current
        await tx.offerDocument.updateMany({
            where: {offerId, isCurrent: true, document: {format: DocumentFormat.DOCX}},
            data: {isCurrent: false},
        });

        // Reuse the reserved DOCX slot if one exists
        const reservedDocxOfferDoc = await tx.offerDocument.findFirst({
            where: {offerId, document: {format: DocumentFormat.RESERVED, status: "UPLOADED"}},
            orderBy: {version: "desc"},
        });

        if (reservedDocxOfferDoc) {
            await tx.document.update({
                where: {id: reservedDocxOfferDoc.documentId},
                data: {taskId: task.id, status: "PENDING"},
            });
            await tx.offerDocument.update({
                where: {id: reservedDocxOfferDoc.id},
                data: {isCurrent: true},
            });
        } else {
            const latestOfferDoc = await tx.offerDocument.findFirst({
                where: {offerId},
                orderBy: {version: "desc"},
                select: {version: true},
            });
            const nextVersion = (latestOfferDoc?.version ?? 0) + 1;

            const doc = await tx.document.create({
                data: {format: "DOCX", status: "PENDING", taskId: task.id},
            });
            await tx.offerDocument.create({
                data: {offerId, documentId: doc.id, version: nextVersion, isCurrent: true},
            });
        }
    });

    const job = await taskQueue.add(taskQueueKey, {taskId: task.id});
    await prisma.task.update({where: {id: task.id}, data: {jobId: job.id}});
    return task;
}
