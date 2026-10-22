import { Task, TaskStatus, TaskTarget, TaskType } from "@prisma/client";
import logger from "@/utils/logger.js";
import env from "./env.js";
import { taskQueueKey } from "../workers/task-contract.js";
import { getTaskQueue } from "../workers/task-queue.js";
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

async function submitJob(taskId: string) {
  const taskQueue = getTaskQueue();
  const existing = await taskQueue.getJob(taskId);

  if (!existing) {
    return taskQueue.add(taskQueueKey, { taskId }, { jobId: taskId });
  }

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

  return existing;
}

/**
 * BullMQ wartet vor dem ersten Befehl, bis Redis erreichbar ist — ohne Grenze.
 * Läuft die Frist ab, kann der Job trotzdem noch nachträglich eingereiht
 * werden; der Worker übernimmt dann auch einen als FAILED markierten Task.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Task queue did not respond within ${timeoutMs} ms.`)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function enqueueTask(taskId: string, options: { markFailedOnError?: boolean } = {}): Promise<void> {
  const { markFailedOnError = true } = options;

  let job;

  try {
    job = await withTimeout(submitJob(taskId), env.TASK_ENQUEUE_TIMEOUT_MS);
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
          prisma.confirmationDocument.updateMany({
            where: { taskId, status: "PENDING" },
            data: { status: "FAILED", error: exception.message },
          }),
          prisma.invoiceDocument.updateMany({
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
