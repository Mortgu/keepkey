/*
 * Diese Datei stellt den BullMQ Worker für die generierung der Dokumente 
 * bereit. 
 */

import { Job, Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";

export default function startDocumentWorker() {
    const documentWorker = new Worker(documentQueueKey, async (job: Job) => {
        const { documentJobId, type, orderId } = job.data;

        /* Status auf "processing" setzen */
        await prisma.documentJob.update({
            where: { id: documentJobId },
            data: { status: 'processing' },
        });

        /* TODO: Hier die Datei erzeugen */

        /* Nach erzeugung der Datei, Status auf "completed" setzen */
        await prisma.documentJob.update({
            where: { id: documentJobId },
            data: { status: 'completed' },
        });

    }, { connection });

    documentWorker.on('failed', async (job, err) => {
        if (job) {
            await prisma.documentJob.update({
                where: { id: job.data.documentJobId },
                data: { status: 'failed', error: err.message },
            });
        }
    });

    return documentWorker;
}