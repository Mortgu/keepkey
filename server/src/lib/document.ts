import { Document, Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import { prisma } from "./prismaClient.js";
import { taskQueue, taskQueueKey } from "../workers/task-queue.js";
import { getNextCloudClient } from "./nextcloud.js";
import logger from "../middlewares/logger.js";

export async function generateDocument(document: Document): Promise<Task> {
  const task = await prisma.task.create({
    data: {
      status: TaskStatus.PENDING,
      type: TaskType.UPLOAD,
      target: TaskTarget.OFFER,
    }
  });

  const job = await taskQueue.add(taskQueueKey, { taskId: task.id });

  await prisma.task.update({
    where: { id: task.id },
    data: { jobId: job.id },
  });

  await prisma.document.update({
    where: { id: document.id },
    data: { taskId: task.id },
  });

  return task;
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
