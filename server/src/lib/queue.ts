import { Queue, Worker, Job } from 'bullmq';
import { prisma } from './prisma.js';
import puppeteer from 'puppeteer';

import fs from 'fs';
import { generateInvoicePDF } from '../utils/document-generator.js';

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
  console.log(type, orderId);
}
