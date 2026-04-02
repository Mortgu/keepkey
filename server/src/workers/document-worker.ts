/*
 * Diese Datei stellt den BullMQ Worker für die generierung der Dokumente 
 * bereit. 
 */

import { Job, Worker } from "bullmq";
import { connection, documentQueueKey } from "../lib/queues.js";
import { prisma } from "../lib/prisma.js";
import { generateOfferPdf } from "../utils/generation/document-generator.js";

export default function startDocumentWorker() {
    const documentWorker = new Worker(documentQueueKey, async (job: Job) => {
        const { documentJobId, type, orderId } = job.data;

        /* Status auf "processing" setzen */
        await prisma.documentJob.update({
            where: { id: documentJobId },
            data: { status: 'processing' },
        });

        /* Relevanten Daten aus der Datenbank holen! */
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                orderPositions: {
                    include: {
                        product: true,
                        contract: true
                    }
                }
            }
        })

        /* TODO: Hier die Datei erzeugen */
        generateOfferPdf({
            data: {
                companyName: "",
                contactPerson: `${order?.user.salutation} ${order?.user.firstName} ${order?.user.lastName}`,
                street: "",
                plzCity: "",
                order: {
                    invoiceNumber: String(order?.id.slice(0, 8)),
                },
                date: String(Date.now()),
                products: "Product 1 & Product 2",
            },
            outputPath: "output.pdf",
            templatePath: "template-offer.html"
        });

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