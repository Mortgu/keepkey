import { Job, UnrecoverableError, Worker } from "bullmq";
import { TaskStatus, DocumentStatus } from "@prisma/client";
import { connection, uploadQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import logger from "../middlewares/logger.js";
import { reserveQuoteIdForOffer } from "../controllers/nextcloud-controller.js";
import { uploadFile } from "../lib/nextcloud.js";
import env from "../lib/env.js";
import path from "path";
import fs from "fs/promises";

type UploadJobData =
  | {
      type: "QUOTE_RESERVATION";
      taskId: string;
      offerId: string;
      quoteId: string;
    }
  | {
      type: "DOCUMENT_UPLOAD";
      taskId: string;
      documentId: string;
      offerId: string;
      displayName: string;
    };

export default function startUploadWorker() {
  const worker = new Worker<UploadJobData>(
    uploadQueueKey,
    async (job: Job<UploadJobData>) => {
      const { type, taskId } = job.data;

      await prisma.task.updateMany({
        where: { id: taskId },
        data: { status: TaskStatus.RUNNING },
      });

      switch (type) {
        case "QUOTE_RESERVATION": {
          try {
            await reserveQuoteIdForOffer(job.data.quoteId);
            await prisma.task.update({
              where: { id: taskId },
              data: { status: TaskStatus.COMPLETED, error: null },
            });
            return;
          } catch (exception: any) {
            throw exception;
          }
        }
        case "DOCUMENT_UPLOAD": {
          const { documentId, displayName } = job.data;

          try {
            const pdfPath = path.join(env.OUTPUT_DIR, `${documentId}.pdf`);
            const docxPath = path.join(env.OUTPUT_DIR, `${documentId}.docx`);

            const [pdfBuffer, docxBuffer] = await Promise.all([
              fs.readFile(pdfPath),
              fs.readFile(docxPath),
            ]);

            await Promise.all([
              uploadFile(
                `${env.NEXTCLOUD_OFFER_PDF_PATH}/${displayName}.pdf`,
                pdfBuffer,
              ),
              uploadFile(
                `${env.NEXTCLOUD_OFFER_ORIGINAL_PATH}/${displayName}.docx`,
                docxBuffer,
              ),
            ]);

            await prisma.document.update({
              where: { id: documentId },
              data: { status: DocumentStatus.UPLOADED },
            });

            await prisma.task.update({
              where: { id: taskId },
              data: { status: TaskStatus.COMPLETED, error: null },
            });

            return;
          } catch (exception: any) {
            throw exception;
          }
        }
        default:
          throw new UnrecoverableError(
            `Unknown upload job type: ${(job.data as any).type}`,
          );
      }
    },
    { connection, concurrency: 2 },
  );

  worker.on("completed", (job) => {
    logger.info(
      `[upload-worker] job ${job.id} completed (taskId: ${job.data.taskId})`,
    );
  });

  worker.on("failed", async (job, err) => {
    logger.error(`[upload-worker] job ${job?.id} failed: ${err.message}`);
    if (!job) return;

    const exhausted =
      err instanceof UnrecoverableError ||
      job.attemptsMade >= (job.opts.attempts ?? 1);

    if (exhausted) {
      await prisma.task.updateMany({
        where: { id: job.data.taskId, status: { not: TaskStatus.FAILED } },
        data: { status: TaskStatus.FAILED, error: err.message },
      });
    }
  });

  worker.on("stalled", (jobId) => {
    logger.warn(`[upload-worker] job ${jobId} stalled`);
  });

  return worker;
}