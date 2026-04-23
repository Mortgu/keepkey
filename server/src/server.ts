import 'dotenv/config';

import express, { type Express } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';
import cors from 'cors';

import router from './routes/router.js';
import { errorHandler } from './middlewares/errorHandler.js';
import config from './config/config.js';

import startDocumentWorker from './workers/document-worker.js';

const app: Express = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ['*', 'DELETE', 'PUT', 'PATCH'],
    credentials: true
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use('/api', router);

// Global error handler
app.use(errorHandler);

// Start document generation worker
const documentWorker = startDocumentWorker();

const shutdown = async () => {
    await documentWorker.close();
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
});
