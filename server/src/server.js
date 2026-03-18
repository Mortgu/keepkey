import 'dotenv/config';

import express from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js'

import { Worker } from 'worker_threads';

import router from './routes/router.js';
import { initializeRedisClient } from './lib/redis.js';

const app = express();

app.all('/api/auth/{*any}', toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use('/api', router);

app.get('/non-blocking', async (req, res) => {
    const client = await initializeRedisClient();
    res.status(200).send(`non blocking`);
})

app.get('/blocking', async (request, response) => {
    console.log("dwawa")

})

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});