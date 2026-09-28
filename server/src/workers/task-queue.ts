import { Queue } from "bullmq";
import type { Redis } from "ioredis";
import logger from "@/utils/logger.js";
import { createProducerConnection } from "../lib/redis.js";
import { taskJobOptions, taskQueueKey, type TaskJobData } from "./task-contract.js";

/**
 * Producer-Seite der Task-Queue (nur API). Queue und Verbindung entstehen erst
 * beim ersten Zugriff — ein Import öffnet keine Redis-Verbindung.
 */
let producer: { queue: Queue<TaskJobData>; connection: Redis } | null = null;

function getProducer() {
    if (!producer) {
        const connection = createProducerConnection();
        const queue = new Queue<TaskJobData>(taskQueueKey, {
            connection,
            defaultJobOptions: taskJobOptions,
        });

        queue.on("error", (error) => {
            logger.warn("task_queue_redis_error", { error: error.message });
        });

        producer = { queue, connection };
    }
    return producer;
}

export function getTaskQueue(): Queue<TaskJobData> {
    return getProducer().queue;
}

export async function pingTaskQueue(): Promise<string> {
    return getProducer().connection.ping();
}

export async function closeTaskQueue(): Promise<void> {
    if (!producer) return;

    const { queue, connection } = producer;
    producer = null;

    await queue.close();
    // Die Queue schließt eine übergebene Verbindung nicht selbst.
    await connection.quit().catch(() => connection.disconnect());
}
