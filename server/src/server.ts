/**
 * Standard-Entry-Point: API und Worker in einem Prozess. Reicht, solange die
 * Dokumentgenerierung die API nicht spürbar ausbremst. Bei Bedarf lassen sich
 * `dist/api.js` und `dist/worker.js` als getrennte Services betreiben —
 * ohne Codeänderung, nur über das Startkommando.
 */
import "@/core/runtime/bootstrap.js";

import env from "@/config/env.js";
import { prisma } from "@/core/prisma.js";
import { startApi } from "@/core/runtime/api-runtime.js";
import { registerShutdown } from "@/core/runtime/shutdown.js";
import { startWorker } from "@/core/runtime/worker-runtime.js";

const worker = await startWorker();
const api = await startApi();

registerShutdown(
    [...api.shutdownSteps, ...worker.shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
