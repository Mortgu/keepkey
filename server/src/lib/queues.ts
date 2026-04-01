import { Queue } from "bullmq";

/* BullMQ redis connection */
export const connection = { host: 'localhost', port: 6379 };

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