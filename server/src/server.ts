import 'dotenv/config';

import express, { type Express } from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js';
import cors from 'cors';

import router from './routes/router.js';

const app: Express = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ['*', 'DELETE'],
    credentials: true
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use('/api', router);

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
