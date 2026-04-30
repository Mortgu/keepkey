import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";
import env from "./env.js";

export const connection = new IORedis(env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

/* Definiert die Queue für die Dokumenten generierung */
export const documentQueueKey = 'document-generation'
export const documentQueue = new Queue(documentQueueKey, {
  connection
});

/* Definiert die Queue für das Hochladen der generierten Dateien nach NextCloud */
export const uploadQueueKey = 'document-upload';
export const uploadQueue = new Queue(uploadQueueKey, {
  connection
});