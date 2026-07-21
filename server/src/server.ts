import "dotenv/config";

import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express } from "express";
import { auth } from "./lib/auth.js";

import { exceptionHandler } from "./middlewares/exception.middleware.js";
import router from "./routes/router.js";

import path from "path";
import env from "./lib/env.js";

import { initDocumentArtifactStore } from "./lib/document-artifact-store.js";
import { getNextcloudInitError, initNextcloud } from "./lib/nextcloud.js";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import { requestIdMiddleware } from "./middlewares/request.middleware.js";
import logger from "./utils/logger.js";
import registerTaskWorker from "./workers/task-worker.js";

const app: Express = express();

app.set('trust proxy', true);

app.use(requestIdMiddleware);

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
    logger.info('object_storage_ready');
} catch (error) {
    logger.error('object_storage_init_failed', { error });
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
    logger.warn('nextcloud_unavailable', { error: getNextcloudInitError() });
}

app.listen(env.PORT, () => {
    logger.info('server_started', { port: env.PORT });
});