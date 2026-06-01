import logger from "../../../middlewares/logger.js";
import {Task} from "@prisma/client";
import runOrderPipeline from "../../../pipelines/order/pipeline.js";

export async function orderGenerateJob(task: Task) {
    logger.info("Task for generating a order document")

    const document = await prisma.document.findUnique({
        where: {taskId: task.id},
    });

    if (!document) {
        throw new Error("Document not found!");
    }

    const order = await prisma.order.findUnique({
        where: {id: document.orderId as string},
    });

    if (!order) {
        throw new Error("Order not found!");
    }

    const pipeline = await runOrderPipeline({
        orderId: order.id,
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