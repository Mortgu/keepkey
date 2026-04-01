/*
 * Diese Datei stellt den BullMQ Worker für das Hochladen der Dokumente 
 * bereit. (NextCloud)
 */

import { Job, Worker } from "bullmq";
import { uploadQueueKey } from "../lib/queues.js";

export default function startUploadWorker() {
    const uploadWorker = new Worker(uploadQueueKey, async (job: Job) => { });
}