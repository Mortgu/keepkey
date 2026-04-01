import 'dotenv/config';

import express, { type Express } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';
import cors from 'cors';

import router from './routes/router.js';
import { errorHandler } from './middlewares/errorHandler.js';
import config from './config/config.js';

import stripeRouter from './routes/stripe.js';
import startDocumentWorker from './workers/document-worker.js';

const app: Express = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ['*', 'DELETE', 'PUT'],
    credentials: true
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

/* Stripe Webhook before express.json() => raw body */
app.use('/api/stripe-webhook', stripeRouter);

app.use(express.json());

app.use('/api', router);

// Global error handler
app.use(errorHandler);

// Start document generation worker
startDocumentWorker();

app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
});
