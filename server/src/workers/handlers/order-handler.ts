import { Task } from "@prisma/client";
import { logger } from "better-auth";
import { prisma } from "../../lib/prismaClient.js";
import { OrderPipelineContext } from "../../pipelines/order/context.js";
import { orderStages } from "../../pipelines/order/stages.js";
import { runPipeline } from "../../pipelines/pipeline.js";
import { createDocumentFiles } from "../task-worker.js";

export default async function orderTaskHandler(task: Task): Promise<void> {
    if (!task) {
        logger.error("called orderTaskHandler with undefined or nul task!")
        return;
    }

    const orderDocument = await prisma.orderDocument.findFirst({
        where: { taskId: task.id },
    });

    if (!orderDocument) {
        logger.warn(`[task-worker] OrderDocument for task ${task.id} not found, skipping.`);
        return;
    }

    const { orderId, id: documentId, version } = orderDocument;

    const pipeline = await runPipeline<OrderPipelineContext>({
        orderId,
        taskId: task.id,
        documentId,
        version,
        docxBuffer: null,
        pdfBuffer: null,
        displayName: null,
    }, orderStages);

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

}