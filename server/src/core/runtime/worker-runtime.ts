import type { Worker } from "bullmq";

import env from "@/config/env.js";
import { createWorkerConnection } from "../redis.js";
import logger from "../logger.js";
import registerTaskWorker from "@/modules/tasks/task-worker.js";
import type { TaskJobData } from "@/modules/tasks/task-contract.js";
import { initObjectStorage } from "./object-storage.js";
import type { ShutdownStep } from "./shutdown.js";

/**
 * Startet die BullMQ-Verarbeitung. Öffnet keinen HTTP-Port und benötigt kein
 * Nextcloud — Dokumente landen ausschließlich im Object Storage.
 */
export async function startWorker(): Promise<{ worker: Worker<TaskJobData>; shutdownSteps: ShutdownStep[] }> {
    await initObjectStorage();

    const connection = createWorkerConnection();
    const worker = registerTaskWorker(connection);

    worker.on("ready", () => logger.info('worker_ready'));
    logger.info('worker_started', { concurrency: env.WORKER_CONCURRENCY });

    return {
        worker,
        shutdownSteps: [
            // Nimmt keine neuen Jobs mehr an und wartet auf laufende.
            { name: "task_worker", run: () => worker.close() },
            { name: "worker_redis", run: () => connection.quit().catch(() => connection.disconnect()) },
        ],
    };
}
