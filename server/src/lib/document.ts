import { Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import logger from "../middlewares/logger.js";
import { taskQueue, taskQueueKey } from "../workers/task-queue.js";
import { AppException } from "./exceptions.js";
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

export async function enqueueTask(
  taskId: string,
  options: { markFailedOnError?: boolean } = {},
): Promise<void> {
  const { markFailedOnError = true } = options;
  let job;
  try {
    const existing = await taskQueue.getJob(taskId);
    if (existing) {
      const state = await existing.getState();
      if (state === "completed") {
        await prisma.task.updateMany({
          where: { id: taskId, status: TaskStatus.COMPLETED },
          data: { status: TaskStatus.PENDING, error: null, runToken: null },
        });
        await existing.retry("completed");
      } else if (state === "failed") {
        await existing.retry(state);
      }
      job = existing;
    } else {
      job = await taskQueue.add(taskQueueKey, { taskId }, { jobId: taskId });
    }
  } catch (exception: any) {
    logger.error('enqueue_task_failed', { taskId, error: exception.message });

    if (markFailedOnError) {
      try {
        await prisma.$transaction([
          prisma.task.updateMany({
            where: { id: taskId, status: TaskStatus.PENDING },
            data: { status: TaskStatus.FAILED, error: exception.message },
          }),
          prisma.offerDocument.updateMany({
            where: { taskId, status: "PENDING" },
            data: { status: "FAILED", error: exception.message },
          }),
          prisma.orderDocument.updateMany({
            where: { taskId, status: "PENDING" },
            data: { status: "FAILED", error: exception.message },
          }),
        ]);
      } catch (dbException: any) {
        logger.error('enqueue_task_persist_failed', { taskId, error: dbException.message });
      }
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
    logger.warn('enqueue_task_jobid_persist_failed', { taskId, error: exception.message });
  });
}
