import 'dotenv/config';

import express from 'express';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth.js'

import router from './routes/router.js';

const app = express();

app.all('/api/auth/{*any}', toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use('/api', router);

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});