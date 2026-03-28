import { Queue, Worker, Job } from 'bullmq';
import { prisma } from './prisma.js';

const connection = { host: 'localhost', port: 6379 };

export const documentQueue = new Queue('document-generation', { connection });

export function startWorker() {
  const worker = new Worker('document-generation', async (job: Job) => {
    const { documentJobId, type, orderId } = job.data;

    // Status auf "processing" setzen
    await prisma.documentJob.update({
      where: { id: documentJobId },
      data: { status: 'processing' },
    });

    // Hier die eigentliche Dokument-Generierung (Platzhalter)
    await generateDocument(type, orderId);

    // Status auf "completed" setzen
    await prisma.documentJob.update({
      where: { id: documentJobId },
      data: { status: 'completed' },
    });
  }, { connection });

  worker.on('failed', async (job, err) => {
    if (job) {
      await prisma.documentJob.update({
        where: { id: job.data.documentJobId },
        data: { status: 'failed', error: err.message },
      });
    }
  });

  console.log('Document generation worker started');
  return worker;
}

async function generateDocument(type: string, orderId: string) {
  // TODO: Echte Implementierung (PDF-Generierung etc.)
  console.log(`Generating ${type} document for order ${orderId}`);
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulation
  console.log(`Finished generating ${type} document for order ${orderId}`);
}
