import { Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOfferDocument } from "../pipelines/offer/pipeline.js";
import { TaskStatus, TaskType } from "@prisma/client";
import { generateOrderDocument } from "../pipelines/order/pipeline.js";

interface TaskData {
  taskId: string;
  taskType: TaskType;
}

export default function startDocumentWorker() {
  const worker = new Worker<TaskData>(documentQueueKey, async (job) => {
    const { taskId, taskType } = job.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`Task ${taskId} not found! Skip.`);
    }

    switch (taskType) {
      case TaskType.OFFER:
        if (!task.offerId) {
          throw new Error("Document job for offer with undefined offerId");
        }

        const offerDocument = await prisma.document.findFirst({
          where: { offerId: task.offerId, isCurrent: true },
          select: { id: true, version: true },
        });

        if (!offerDocument) {
          throw new Error(
            `No current document row found for offer ${task.offerId}`,
          );
        }

        await prisma.document.update({
          where: { id: offerDocument.id },
          data: { status: "PROCESSING" },
        });

        const { displayName } = await generateOfferDocument(
          task.offerId,
          taskId,
          offerDocument.id,
          offerDocument.version,
        );

        await prisma.document.update({
          where: { id: offerDocument.id },
          data: {
            displayName,
            pdfReady: true,
            docxReady: true,
            status: "GENERATED",
          },
        });

        await prisma.task.update({
          where: { id: taskId },
          data: { status: TaskStatus.COMPLETED },
        });

        break;
      case TaskType.ORDER:
        if (!task.orderId) {
          throw new Error("Document job for order with undefined orderId!");
        }

        const orderDocument = await prisma.document.findFirst({
          where: { orderId: task.orderId, isCurrent: true },
          select: { id: true, version: true },
        });

        if (!orderDocument) {
          throw new Error(`No current document row found for order ${task.orderId}`);
        }

        await prisma.document.update({
          where: { id: orderDocument.id },
          data: { status: "PROCESSING" },
        });

        const { displayName: orderDisplayName } = await generateOrderDocument(
          task.orderId,
          taskId,
          orderDocument.id,
          orderDocument.version,
        );

        await prisma.document.update({
          where: { id: orderDocument.id },
          data: {
            displayName: orderDisplayName,
            pdfReady: true,
            docxReady: true,
            status: "GENERATED",
          },
        });

        await prisma.task.update({
          where: { id: taskId },
          data: { status: TaskStatus.COMPLETED },
        });

        break;
      default:
        throw new Error(`Task ${task.id} with unknown type propertie!`);
    }
  },
    { connection, concurrency: 2 },
  );

  worker.on("completed", async (job) => {
    if (job) {
      console.log(
        `[worker] job ${job.id} completed (taskId: ${job.data.taskId})`,
      );
    }
  });

  worker.on("failed", async (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err.message);

    if (job) {
      await prisma.task.updateMany({
        where: { id: job.data.taskId },
        data: { status: TaskStatus.FAILED, error: err.message },
      });
    }
  });

  worker.on("stalled", (jobId) => {
    console.warn(`[worker] job ${jobId} stalled`);
  });

  return worker;
}
