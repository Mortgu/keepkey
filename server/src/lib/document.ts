import { Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import { prisma } from "./prismaClient.js";
import { taskQueue, taskQueueKey } from "../workers/task-queue.js";
import { getNextCloudClient } from "./nextcloud.js";
import logger from "../middlewares/logger.js";

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

export async function uploadDocument(filename: string, uploadDir: string, content: Buffer): Promise<string> {
  const client = getNextCloudClient();

  try {
    await client.putFileContents(`${uploadDir}/${filename}`, content, {
      overwrite: false,
    });

    return `${uploadDir}/${filename}`;
  } catch (exception: any) {
    logger.error(exception);
    throw new Error("Upload failed!");
  }
}
