import { Queue } from "bullmq";
import connection from "../lib/redis.js";

export interface TaskJobData {
    taskId: string;
    chainGenerationOnSuccess?: boolean;
}

export const taskQueueKey = "task-queue";
export const taskQueue = new Queue<TaskJobData>(taskQueueKey, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100, age: 3600 },
        removeOnFail: { count: 500 }
    }
});

export const templateSyncQueue = new Queue('template-sync', {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
    },
})