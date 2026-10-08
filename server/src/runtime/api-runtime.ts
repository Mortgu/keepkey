import { createServer, type Server } from "node:http";

import { createApp } from "@/app.js";
import env from "@/config/env.js";
import { getNextcloudInitError, initNextcloud } from "@/lib/nextcloud.js";
import logger from "@/utils/logger.js";
import { closeTaskQueue } from "@/workers/task-queue.js";
import { initObjectStorage } from "./object-storage.js";
import type { ShutdownStep } from "./shutdown.js";

function listen(server: Server, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, () => {
            server.off("error", reject);
            resolve();
        });
    });
}

function closeServer(server: Server): Promise<void> {
    // Nimmt keine neuen Verbindungen mehr an, schließt ruhende Keep-Alive-
    // Verbindungen und wartet auf laufende Requests.
    return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
}

/**
 * Startet die HTTP-API. Registriert keinen Worker; die Producer-Queue entsteht
 * erst beim ersten Enqueue.
 */
export async function startApi(): Promise<{ server: Server; shutdownSteps: ShutdownStep[] }> {
    await initObjectStorage();

    const nextcloudInitialized = await initNextcloud();
    if (!nextcloudInitialized) {
        logger.warn('nextcloud_unavailable', { error: getNextcloudInitError() });
    }

    const httpServer = createServer(createApp());
    await listen(httpServer, env.PORT);
    logger.info('server_started', { port: env.PORT });

    return {
        server: httpServer,
        shutdownSteps: [
            { name: "http", run: () => closeServer(httpServer) },
            { name: "task_queue", run: closeTaskQueue },
        ],
    };
}
