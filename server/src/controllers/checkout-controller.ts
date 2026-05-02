import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

export const handleGenerate = async (request: Request, response: Response) => {
  const { orderId } = request.body;

  const documentJob = await prisma.documentJob.create({
    data: {
      orderId: orderId,
      type: "offer",
      status: "pending",
    },
  });

  const job = await documentQueue.add(documentQueueKey, {
    documentJobId: documentJob.id,
    type: "offer",
    orderId: orderId,
  });

  await prisma.documentJob.update({
    where: { id: documentJob.id },
    data: { jobId: job.id },
  });

  return response.status(200).send({
    documentJob,
    job,
  });
};
