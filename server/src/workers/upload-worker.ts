import { Job, UnrecoverableError, Worker } from "bullmq";
import { TaskStatus } from "@prisma/client";
import { connection, uploadQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import {
  QuoteIdAlreadyReservedError,
  reserveQuoteIdInNextCloud,
} from "../lib/nextcloud.js";
import logger from "../middlewares/logger.js";

type UploadJobData =
  | {
    type: "QUOTE_RESERVATION";
    taskId: string;
    offerId: string;
    quoteId: string;
  };

export default function startUploadWorker() {
  const worker = new Worker<UploadJobData>(uploadQueueKey, async (job: Job<UploadJobData>) => {
    const { type, taskId } = job.data;

    await prisma.task.updateMany({
      where: { id: taskId },
      data: { status: TaskStatus.RUNNING },
    });

    switch (type) {
      case "QUOTE_RESERVATION": {
        try {
          await reserveQuoteIdInNextCloud(job.data.quoteId);
          await prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.COMPLETED, error: null },
          });
          return;
        } catch (err) {
          if (err instanceof QuoteIdAlreadyReservedError) {
            await prisma.task.update({
              where: { id: taskId },
              data: { status: TaskStatus.FAILED, error: err.message },
            });
            throw new UnrecoverableError(err.message);
          }
          throw err;
        }
      }
      default:
        throw new UnrecoverableError(`Unknown upload job type: ${(job.data as any).type}`);
    }
  },
    { connection, concurrency: 2 },
  );

  worker.on("completed", (job) => {
    logger.info(`[upload-worker] job ${job.id} completed (taskId: ${job.data.taskId})`);
  });

  worker.on("failed", async (job, err) => {
    logger.error(`[upload-worker] job ${job?.id} failed: ${err.message}`);
    if (!job) return;

    const exhausted = err instanceof UnrecoverableError ||
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
