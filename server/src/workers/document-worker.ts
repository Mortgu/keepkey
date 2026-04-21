/*
 * Diese Datei stellt den BullMQ Worker für die generierung der Dokumente 
 * bereit. 
 */

import { Job, Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOfferPdf } from "../utils/generation/document-generator.js";
import { formatDate } from "../utils/utils.js";

export default function startDocumentWorker() {
    const documentWorker = new Worker(documentQueueKey, async (job: Job) => {
        const { documentJobId, type } = job.data;


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