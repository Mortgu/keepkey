import "./runtime/bootstrap.js";

import env from "./lib/env.js";
import { prisma } from "./lib/prismaClient.js";
import { startApi } from "./runtime/api-runtime.js";
import { registerShutdown } from "./runtime/shutdown.js";

const { shutdownSteps } = await startApi();

registerShutdown(
    [...shutdownSteps, { name: "prisma", run: () => prisma.$disconnect() }],
    { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
);
