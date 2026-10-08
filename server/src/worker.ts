import "./runtime/bootstrap.js";

import env from "./config/env.js";
import { prisma } from "./lib/prismaClient.js";
import { registerShutdown } from "./runtime/shutdown.js";
import { startWorker } from "./runtime/worker-runtime.js";

const { shutdownSteps } = await startWorker();

registerShutdown(
    [...shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
