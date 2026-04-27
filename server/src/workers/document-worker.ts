import { Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOfferDocx, convertAndSaveOfferDocuments } from "../services/documentService.js";

interface DocumentJobData {
    documentJobId: string;
    type: 'offer' | 'invoice';
}

export default function startDocumentWorker() {
    const worker = new Worker<DocumentJobData>(documentQueueKey, async (job) => {
        const { documentJobId, type } = job.data;

        const documentJob = await prisma.documentJob.findUnique({
            where: { id: documentJobId },
        });

        if (!documentJob) {
            throw new Error(`DocumentJob "${documentJobId}" not found — skipping`);
        }

        switch (type) {
            case 'offer': {
                if (!documentJob.offerId) {
                    throw new Error("Document job for offer with undefined offerId");
                }

                await prisma.documentJob.update({
                    where: { id: documentJobId },
                    data: { status: 'generating' },
                });

                const { docx, outDir } = await generateOfferDocx(documentJob.offerId, documentJobId);

                await prisma.documentJob.update({
                    where: { id: documentJobId },
                    data: { status: 'converting' },
                });

                const { pdfPath, docxPath } = await convertAndSaveOfferDocuments(docx, outDir);

                await prisma.documentJob.update({
                    where: { id: documentJobId },
                    data: { status: 'completed', docxPath, pdfPath },
                });
                break;
            }
            case 'invoice':
                if (!documentJob.orderId) {
                    throw new Error("Document job for order with undefined orderId");
                }
                // TODO
                break;
            default:
                throw new Error(`Unknown document type "${type}" or missing reference ID`);
        }

    }, { connection, concurrency: 2 });

    worker.on('completed', async (job) => {
        console.log(`[worker] job ${job.id} completed (documentJobId: ${job.data.documentJobId})`);

        if (job) {

        }
    });

    worker.on('failed', async (job, err) => {
        console.error(`[worker] job ${job?.id} failed:`, err);

        if (job) {
            await prisma.documentJob.updateMany({
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
