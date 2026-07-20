import { Redis as IORedis } from "ioredis";

import env from "./env.js";

const REDIS_URL = env.REDIS_URL ?? "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

export default connection;
