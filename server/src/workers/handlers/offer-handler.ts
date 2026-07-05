import { prisma, Task } from "../../lib/prismaClient.js";
import logger from "../../middlewares/logger.js";
import { OfferPipelineContext } from "../../pipelines/offer/context.js";
import { offerStages } from "../../pipelines/offer/stages.js";
import { runPipeline } from "../../pipelines/pipeline.js";
import { createDocumentFiles } from "../task-worker.js";

export default async function offerTaskHandler(task: Task): Promise<void> {
    if (!task) {
        logger.error("called offerTaskHandler with undefined or nul task!")
        return;
    }

    const offerDocument = await prisma.offerDocument.findFirst({
        where: { taskId: task.id }
    });

    if (!offerDocument) {
        logger.warn(`[task-worker] OfferDocument for task ${task.id} not found, skipping.`);
        return;
    }

    const { offerId, id: documentId, version } = offerDocument;

    const pipeline = await runPipeline<OfferPipelineContext>({
        offerId,
        taskId: task.id,
        documentId,
        version,
        docxBuffer: null,
        pdfBuffer: null,
        displayName: null,
    }, offerStages);

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

    await prisma.offerDocument.update({
        where: { id: offerDocument.id },
        data: {
            pdfId: pdf.id,
            docxId: docx.id,
            status: "GENERATED",
            displayName: files.displayName,
        },
    });
}