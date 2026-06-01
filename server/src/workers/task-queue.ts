import {Queue} from "bullmq";
import connection from "../lib/redis.js";

export interface TaskJobData {
    taskId: string;
    chainGenerationOnSuccess?: boolean;
}

export const taskQueueKey = "task-queue";
export const taskQueue = new Queue<TaskJobData>(taskQueueKey, {connection});
