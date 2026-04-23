import { Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOffer, generateInvoice } from "../services/documentService.js";

interface DocumentJobData {
    documentJobId: string;
    type: 'offer' | 'invoice';
}

export default function startDocumentWorker() {
    const worker = new Worker<DocumentJobData>(documentQueueKey, async (job) => {
        const { documentJobId, type } = job.data;

        await prisma.documentJob.update({
            where: { id: documentJobId },
            data: { status: 'processing' },
        });

        const documentJob = await prisma.documentJob.findUniqueOrThrow({
            where: { id: documentJobId },
        });

        if (type === 'offer' && documentJob.offerId) {
            await generateOffer(documentJob.offerId, documentJobId);
        } else if (type === 'invoice' && documentJob.orderId) {
            await generateInvoice(documentJob.orderId, documentJobId);
        } else {
            throw new Error(`Unknown document type "${type}" or missing reference ID`);
        }


    }, { connection, concurrency: 2 });

    worker.on('completed', async (job) => {
        console.log(`[worker] job ${job.id} completed (documentJobId: ${job.data.documentJobId})`);

        if (job) {
            await prisma.documentJob.update({
                where: { id: job.id },
                data: { status: 'completed' },
            });
        }
    });

    worker.on('failed', async (job, err) => {
        console.error(`[worker] job ${job?.id} failed:`, err);

        if (job) {
            await prisma.documentJob.update({
                where: { id: job.data.documentJobId },
                data: { status: 'failed', error: err.message },
            });
        }
    });

    worker.on('stalled', (jobId) => {
        console.warn(`[worker] job ${jobId} stalled`);
    });

    return worker;
}
