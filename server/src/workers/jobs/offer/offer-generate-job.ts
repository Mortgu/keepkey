import logger from "../../../middlewares/logger.js";
import {prisma} from "../../../lib/prisma.js";
import {Task} from "@prisma/client";
import runOfferPipeline from "../../../pipelines/offer/pipeline.js";

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