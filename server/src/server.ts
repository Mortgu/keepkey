import "dotenv/config";

import express, { type Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";

import router from "./routes/router.js";
import { exceptionHandler } from "./middlewares/exception-handler.js";

import path from "path";
import env from "./lib/env.js";

import morganMiddleware from "./middlewares/morgan.js";
import logger from "./middlewares/logger.js";
import registerTaskWorker from "./workers/task-worker.js";
import { getNextcloudInitError, initNextcloud } from "./lib/nextcloud.js";
import { initDocumentArtifactStore } from "./lib/document-artifact-store.js";

const app: Express = express();

// Logging
app.use(morganMiddleware);

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api", router);

app.use("/api/*splat", (_req, res) => res.status(404).json({ message: "Not found" }));

app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.get("{*path}", (req, res) => {
    res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
});

// Global error handler
app.use(exceptionHandler);

try {
    await initDocumentArtifactStore();
    logger.info("[object-storage] Bucket access verified.");
} catch (error) {
    logger.error(`[object-storage] Bucket initialization failed: ${error}`);
    throw error;
}

const taskWorker = registerTaskWorker();

const shutdown = async () => {
    await Promise.all([taskWorker.close()]);
    process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const nextcloudInitialized = await initNextcloud();
if (!nextcloudInitialized) {
    logger.warn(`[nextcloud] ${getNextcloudInitError()}. Upload functionality is disabled.`);
}

app.listen(env.PORT, () => {
    logger.info(`Server is listening on port ${env.PORT}`);
});
