/**
 * Übergangs-Entry-Point: API und Worker in einem Prozess, wie vor der
 * Trennung. Nur als Fallback während des Rollouts — Produktion startet
 * `dist/api.js` und `dist/worker.js` als getrennte Services.
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
