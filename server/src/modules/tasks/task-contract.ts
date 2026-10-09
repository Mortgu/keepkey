import type { DefaultJobOptions } from "bullmq";

/**
 * Vertrag zwischen Producer (API) und Consumer (Worker). Bewusst frei von
 * Seiteneffekten: Beide Seiten importieren diese Datei, ohne dadurch eine
 * Redis-Verbindung zu öffnen.
 */
export interface TaskJobData {
    taskId: string;
    chainGenerationOnSuccess?: boolean;
}

export const taskQueueKey = "task-queue";

export const taskJobOptions: DefaultJobOptions = {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100, age: 3600 },
    removeOnFail: { count: 500 },
};
