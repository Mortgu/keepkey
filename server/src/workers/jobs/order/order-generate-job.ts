import path from "path";
import logger from "../../../middlewares/logger.js";
import { Task } from "@prisma/client";
import { prisma } from "../../../lib/prismaClient.js";
import runOrderPipeline from "../../../pipelines/order/pipeline.js";
import env from "../../../lib/env.js";

export async function orderGenerateJob(task: Task) {
    logger.info("Task for generating an order document");

    const document = await prisma.document.findUnique({
        where: { taskId: task.id },
        include: { orderDocument: true },
    });

    if (!document || !document.orderDocument) {
        throw new Error("Document or OrderDocument not found for task!");
    }

    const orderDoc = document.orderDocument;
    const { orderId, version } = orderDoc;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error("Order not found!");
    }

    await runOrderPipeline({
        orderId: order.id,
        taskId: task.id,
        documentId: document.id,
        version,
    });

    const docxLocalPath = path.join(env.OUTPUT_DIR, `${document.id}.docx`);
    const pdfLocalPath = path.join(env.OUTPUT_DIR, `${document.id}.pdf`);
    const displayName = `${order.orderId}_v${version}`;

    await prisma.$transaction(async (tx) => {
        await tx.document.update({
            where: { id: document.id },
            data: { status: "GENERATED", path: docxLocalPath, displayName },
        });

        const existingPdfOrderDoc = await tx.orderDocument.findFirst({
            where: { orderId, version, document: { format: "PDF" } },
            select: { documentId: true },
        });

        if (existingPdfOrderDoc) {
            await tx.document.update({
                where: { id: existingPdfOrderDoc.documentId },
                data: { status: "GENERATED", path: pdfLocalPath, displayName },
            });
        } else {
            const pdfDoc = await tx.document.create({
                data: { format: "PDF", status: "GENERATED", path: pdfLocalPath, displayName },
            });
            await tx.orderDocument.create({
                data: { orderId, documentId: pdfDoc.id, version, isCurrent: true },
            });
        }
    });
}
