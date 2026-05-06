import "dotenv/config";

import express, { Request, Response, type Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";

import router from "./routes/router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import config from "./config/config.js";

import startDocumentWorker from "./workers/document-worker.js";
import path from "path";
import env from "./lib/env.js";

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';

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

//manageNextcloud();

app.use("/api", router);

app.use(express.static(path.join(process.cwd(), "../client/dist")));

// Global error handler
app.use(errorHandler);

// Start document generation worker
const documentWorker = startDocumentWorker();

const shutdown = async () => {
  await documentWorker.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(config.port, () => {
  console.log(`Server is listening on port ${config.port}`);
});
