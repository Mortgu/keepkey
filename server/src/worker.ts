import "@/core/runtime/bootstrap.js";

import env from "@/config/env.js";
import { prisma } from "@/core/prisma.js";
import { registerShutdown } from "@/core/runtime/shutdown.js";
import { startWorker } from "@/core/runtime/worker-runtime.js";

const { shutdownSteps } = await startWorker();

registerShutdown(
    [...shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
