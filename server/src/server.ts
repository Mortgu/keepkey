import "dotenv/config";

import express, { type Express } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";

import router from "./routes/router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import config from "./config/config.js";

import startDocumentWorker from "./workers/document-worker.js";
import path from "path";
import env from "./lib/env.js";

const app: Express = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN ?? "http://localhost:5173",
    methods: ["*", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);

app.use("/generated", express.static(path.join(process.cwd(), "generated")));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

//manageNextcloud();

app.use("/api", router);

app.use(express.static(path.join(process.cwd(), "../client/dist")));

app.get("/*splat", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
});

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
