import "@/core/runtime/bootstrap.js";

import env from "@/config/env.js";
import { prisma } from "@/core/prisma.js";
import { startApi } from "@/core/runtime/api-runtime.js";
import { registerShutdown } from "@/core/runtime/shutdown.js";

const { shutdownSteps } = await startApi();

registerShutdown(
    [...shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
