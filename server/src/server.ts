/**
 * Standard-Entry-Point: API und Worker in einem Prozess. Reicht, solange die
 * Dokumentgenerierung die API nicht spürbar ausbremst. Bei Bedarf lassen sich
 * `dist/api.js` und `dist/worker.js` als getrennte Services betreiben —
 * ohne Codeänderung, nur über das Startkommando.
 */
import "./runtime/bootstrap.js";

import env from "./lib/env.js";
import { prisma } from "./lib/prismaClient.js";
import { startApi } from "./runtime/api-runtime.js";
import { registerShutdown } from "./runtime/shutdown.js";
import { startWorker } from "./runtime/worker-runtime.js";

const worker = await startWorker();
const api = await startApi();

registerShutdown(
    [...api.shutdownSteps, ...worker.shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
