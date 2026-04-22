/*
 * Diese Datei stellt den BullMQ Worker für die generierung der Dokumente
 * bereit.
 */

import { Job, Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOffer, generateInvoice } from "../services/documentService.js";

export default function startDocumentWorker() {
    const documentWorker = new Worker(documentQueueKey, async (job: Job) => {
        const { documentJobId, type } = job.data;

        await prisma.documentJob.update({
            where: { id: documentJobId },
            data: { status: 'processing' },
        });

        const documentJob = await prisma.documentJob.findUniqueOrThrow({
            where: { id: documentJobId }
        });

        if (type === 'offer' && documentJob.offerId) {
            await generateOffer(documentJob.offerId, documentJobId);
        } else if (type === 'invoice' && documentJob.orderId) {
            await generateInvoice(documentJob.orderId, documentJobId);
        } else {
            throw new Error(`Unknown document type "${type}" or missing reference ID`);
        }

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
