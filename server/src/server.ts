import "dotenv/config";

import express, {type Express, Request, Response} from "express";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";
import cors from "cors";

import router from "./routes/router.js";
import {exceptionHandler} from "./middlewares/exception-handler.js";

import path from "path";
import env from "./lib/env.js";

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import morganMiddleware from "./middlewares/morgan.js";
import logger from "./middlewares/logger.js";
import registerTaskWorker from "./workers/task-worker.js";
import {getNextcloudInitError, initNextcloud} from "./lib/nextcloud.js";

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Meine API',
            version: '1.0.0'
        }
    },

    apis: ['./src/routes/*.ts', './src/schemas/*.ts'],
}

const swaggerSpec = swaggerJsdoc(options);

const app: Express = express();

// Logging
app.use(morganMiddleware);

app.use(
    cors({
        origin: env.CORS_ORIGIN ?? "http://localhost:5173",
        methods: ["*", "DELETE", "PUT", "PATCH"],
        credentials: true,
    }),
);

app.use('/api-docs', swaggerui.serve, swaggerui.setup(swaggerSpec));

app.get('/swagger.json', (request: Request, response: Response) => {
    response.setHeader('Content-Type', 'application/json');
    response.send(swaggerSpec)
});

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api", router);

app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.get("{*path}", (req, res) => {
    res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
});

// Global error handler
app.use(exceptionHandler);

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
