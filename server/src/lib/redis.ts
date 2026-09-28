import { Redis as IORedis } from "ioredis";

import env from "./env.js";

const REDIS_URL = env.REDIS_URL ?? "redis://localhost:6379";

/**
 * Verbindung für den BullMQ-Worker: wartet bei Ausfällen beliebig lange und
 * verbindet sich neu. BullMQ verlangt dafür `maxRetriesPerRequest: null`.
 */
export function createWorkerConnection(): IORedis {
    return new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
    });
}

/**
 * Verbindung für den Producer in der API: Ein Request darf bei Redis-Ausfall
 * nicht hängen, sondern soll zeitnah scheitern (→ 503). Ohne Offline-Queue
 * schlagen Befehle bei getrennter Verbindung sofort fehl; die Verbindung selbst
 * verbindet sich im Hintergrund weiter neu.
 */
export function createProducerConnection(): IORedis {
    return new IORedis(REDIS_URL, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5_000,
        commandTimeout: 5_000,
    });
}
