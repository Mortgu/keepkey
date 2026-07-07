import { Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { taskQueue, taskQueueKey } from "../workers/task-queue.js";
import { AppException } from "./exceptions.js";
import { getNextCloudClient } from "./nextcloud.js";
import { prisma } from "./prismaClient.js";

export async function createTask(target: TaskTarget): Promise<Task> {
  return prisma.task.create({
    data: {
      status: TaskStatus.PENDING,
      type: TaskType.GENERATION,
      target,
    },
  });
}

export async function enqueueTask(taskId: string): Promise<void> {
  let job;
  try {
    job = await taskQueue.add(taskQueueKey, { taskId });
  } catch (exception: any) {
    logger.error(`[enqueueTask] failed to enqueue task ${taskId}: ${exception.message}`);

    // Best-effort: Task + zugehörige Dokumente auf FAILED setzen (Muster aus task-worker.ts)
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.FAILED, error: exception.message },
      });

      await prisma.offerDocument.updateMany({
        where: { taskId },
        data: { status: "FAILED", error: exception.message },
      });

      await prisma.orderDocument.updateMany({
        where: { taskId },
        data: { status: "FAILED", error: exception.message },
      });
    } catch (dbException: any) {
      logger.error(`[enqueueTask] failed to persist FAILED state for task ${taskId}: ${dbException.message}`);
    }

    throw new AppException(
      "Dokument-Generierung konnte nicht eingereiht werden!",
      503,
      "TASK_ENQUEUE_FAILED",
    );
  }

  // Job ist bereits enqueued — schlägt nur das jobId-Update fehl, den Task NICHT
  // auf FAILED setzen (der Worker verarbeitet den Job trotzdem), nur loggen.
  await prisma.task.update({
    where: { id: taskId },
    data: { jobId: job.id },
  }).catch((exception: any) => {
    logger.warn(`[enqueueTask] failed to persist jobId for task ${taskId}: ${exception.message}`);
  });
}

export type UploadResult = {
  remotePath: string;
  uploadedAt: Date;
  size: number;
};

export async function uploadDocument(filename: string, uploadDir: string, content: Buffer): Promise<UploadResult> {
  const client = getNextCloudClient();
  const remotePath = `${uploadDir}/${filename}`;

  try {
    await client.putFileContents(remotePath, content, {
      overwrite: false,
    });

    return {
      remotePath,
      uploadedAt: new Date(),
      size: content.length,
    };
  } catch (exception: any) {
    logger.error(exception);
    throw new Error("Upload failed!");
  }
}
