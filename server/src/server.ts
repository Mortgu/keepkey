import "dotenv/config";

import express, {type Express, Request, Response} from "express";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";
import cors from "cors";

import router from "./routes/router.js";
import {errorHandler} from "./middlewares/errorHandler.js";
import config from "./config/config.js";

import startDocumentWorker from "./workers/document-worker.js";
import registerUploadWorker from "./workers/upload-worker.js";
import path from "path";
import env from "./lib/env.js";

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import morganMiddleware from "./middlewares/morgan.js";
import logger from "./middlewares/logger.js";

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

// Global error handler
app.use(errorHandler);

// Start document generation worker
const documentWorker = startDocumentWorker();
const uploadWorker = registerUploadWorker();

const shutdown = async () => {
    await Promise.all([documentWorker.close(), uploadWorker.close()]);
    process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(config.port, () => {
    logger.info(`Server is listening on port ${config.port}`);
});
