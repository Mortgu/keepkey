import { Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { taskQueue, taskQueueKey } from "../workers/task-queue.js";
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
  const job = await taskQueue.add(taskQueueKey, { taskId });

  await prisma.task.update({
    where: { id: taskId },
    data: { jobId: job.id },
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
