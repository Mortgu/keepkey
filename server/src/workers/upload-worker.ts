import { Job, UnrecoverableError, Worker } from "bullmq";
import { TaskStatus } from "@prisma/client";
import { connection, uploadQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import logger from "../middlewares/logger.js";
import { reserveQuoteIdInNextCloud } from "../controllers/nextcloud-controller.js";
import { NextCloudReservationFailedException } from "../exceptions/exceptions.js";

type UploadJobData =
  | {
    type: "QUOTE_RESERVATION";
    taskId: string;
    offerId: string;
    quoteId: string;
  };

export default function startUploadWorker() {
  const worker = new Worker<UploadJobData>(uploadQueueKey, async (job: Job<UploadJobData>) => {
    const { type, taskId, quoteId } = job.data;

    await prisma.task.updateMany({
      where: { id: taskId },
      data: { status: TaskStatus.RUNNING },
    });

    switch (type) {
      case "QUOTE_RESERVATION": {
        try {
          await reserveQuoteIdInNextCloud(quoteId);
          await prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.COMPLETED, error: null },
          });
          return;
        } catch (exception: any) {
          if (exception instanceof NextCloudReservationFailedException) {
            await prisma.task.update({
              where: { id: taskId },
              data: { status: TaskStatus.FAILED, error: exception.message },
            });
            throw new UnrecoverableError(exception.message);
          }
          throw exception;
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
