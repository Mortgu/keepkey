import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import calculatePrice from "../utils/products.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";
import {
  OfferFlatRate,
  OfferPosition,
  TaskStatus,
  TaskType,
} from "@prisma/client";
import { toDate } from "../utils/utils.js";
import env from "../lib/env.js";

export const getOffers = async (request: Request, response: Response) => {
  const { search, companyIds, contactPersonIds, sort } = request.query;

  const where: {
    AND?: any[];
    quoteId?: { contains: string };
    customerId?: { in: string[] };
    contactPersonId?: { in: string[] };
  } = {};

  if (search && typeof search === "string") {
    where.quoteId = { contains: search };
  }

  if (companyIds) {
    const ids = Array.isArray(companyIds) ? companyIds : [companyIds];
    where.customerId = { in: ids as string[] };
  }

  if (contactPersonIds) {
    const ids = Array.isArray(contactPersonIds) ? contactPersonIds : [contactPersonIds];
    where.contactPersonId = { in: ids as string[] };
  }

  const orderBy = sort === "createdAt:asc" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

  const offers = await prisma.offer.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
    include: {
      customer: true,
      supplier: true,
      customerContactPerson: true,
      tasks: true,
      documents: true,
      offerPositions: {
        include: {
          product: true,
          contract: true,
        },
      },
      offerFlatRates: {
        include: {
          flatRate: true,
        },
      },
    },
  });

  return response.status(200).json(offers);
};

export const getOfferById = async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    const offer = await prisma.offer.findFirstOrThrow({
      where: { id: id as string },
      include: {
        tasks: true,
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        },
      },
    });

    return response.status(200).json(offer);
  } catch (exception: any) {
    return response.status(404).json({
      message: "Offer not found!",
    });
  }
};

export const getOfferTasks = async (request: Request, response: Response) => {
  const { id } = request.params;

  const job = await prisma.task.findFirst({
    where: { offerId: id as string },
  });

  return response.status(200).json(job);
};

export const getOfferTaskById = async (request: Request, response: Response) => {
  const { id, jobId } = request.params;

  try {
    const offerTask = await prisma.task.findFirstOrThrow({
      where: {
        AND: [
          { id: jobId as string },
          { offerId: id as string }
        ],
      },
    });

    return response.status(200).json(offerTask);
  } catch (exception: any) {
    return response.status(404).json({
      message: "Job not found!",
    });
  }
};

export const createOfferTask = async (request: Request, response: Response) => {
  const { offer } = request.body;

  if (!offer) {
    return response.status(404).json({
      message: "Failed to create offer task. Missing offer!",
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        offerId: offer.id,
        type: TaskType.OFFER,
        status: TaskStatus.PENDING,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.document.updateMany({
        where: { offerId: offer.id, isCurrent: true },
        data: { isCurrent: false },
      });

      const latest = await tx.document.findFirst({
        where: { offerId: offer.id },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const nextVersion = (latest?.version ?? 0) + 1;

      await tx.document.create({
        data: {
          offerId: offer.id,
          version: nextVersion,
          status: "PENDING",
          isCurrent: true,
        },
      });
    });

    const job = await documentQueue.add(documentQueueKey, {
      taskId: task.id,
      taskType: TaskType.OFFER,
    });

    await prisma.task.update({
      where: { id: task.id },
      data: { jobId: job.id },
    });

    return response.status(200).json(offer);
  } catch (exception: any) {
    return response.status(500).json({
      message: `Failed to create task for offer: ${offer.id}`,
    });
  }
};

export const deleteOfferDocument = async (
  request: Request,
  response: Response,
) => {
  const offerId = request.params.id as string;
  const documentId = request.params.documentId as string;

  const document = await prisma.document.findFirst({
    where: { id: documentId, offerId },
    select: { id: true },
  });

  if (!document) {
    return response.status(404).json({ message: "Document not found" });
  }

  try {
    await prisma.document.delete({ where: { id: document.id } });

    for (const ext of ["pdf", "docx"]) {
      const filePath = path.join(env.OUTPUT_DIR, `${document.id}.${ext}`);
      await fs.promises.rm(filePath, { force: true });
    }

    return response.status(200).json({ success: true });
  } catch (exception: any) {
    return response.status(500).json({
      message: "Could not delete document: " + exception.message,
    });
  }
};

export const downloadOfferDocument = async (
  request: Request,
  response: Response,
) => {
  const offerId = request.params.id as string;
  const documentId = request.params.documentId as string;
  const format = request.params.format as string;

  if (format !== "pdf" && format !== "docx") {
    return response.status(400).json({ message: "Invalid format" });
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, offerId },
    select: {
      id: true,
      displayName: true,
      pdfReady: true,
      docxReady: true,
    },
  });

  if (!document) {
    return response.status(404).json({ message: "Document not found" });
  }

  const ready = format === "pdf" ? document.pdfReady : document.docxReady;
  if (!ready) {
    return response.status(409).json({ message: "Document not yet generated" });
  }

  const filePath = path.join(env.OUTPUT_DIR, `${document.id}.${format}`);
  const downloadName = `${document.displayName ?? document.id}.${format}`;

  return response.download(filePath, downloadName);
};

export const createOffer = async (request: Request, response: Response, next: NextFunction) => {
  const { body } = request;

  if (!body) {
    return response.status(400).json({
      message: "Bad request",
    });
  }

  const { offer, positions, flatRates } = body;

  if (!offer || !positions) {
    return response.status(400).json({
      message: "Bad request.",
    });
  }

  for (const position of positions) {
    position["total_cents"] = await calculatePrice({
      productId: position.productId,
      contractId: position.contractId,
      duration: position.duration_months,
      quantity: position.quantity,
      customerId: offer.customerId,
    });
  }

  try {
    request.body.offer = await prisma.$transaction(async (tx) => {
      let net_amount_positions = positions.reduce(
        (sum: number, p: OfferPosition) => sum + p.total_cents, 0);

      let net_amount_flatrates = flatRates.reduce(
        (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

      let net_amount = net_amount_positions + net_amount_flatrates;

      const { supplierId, validUntil, requestFrom, date, ...offerFields } = body.offer;
      const offer = await tx.offer.create({
        data: {
          ...offerFields,
          date: toDate(date) ?? new Date(),
          supplierId: supplierId || null,
          validUntil: toDate(validUntil),
          requestFrom: toDate(requestFrom),
          net_amount: net_amount,
        },
      });

      for (const position of positions) {
        const { productId, contractId, duration_months,
          quantity, optional, total_cents } = position;

        await tx.offerPosition.create({
          data: {
            offerId: offer.id,
            productId,
            contractId,
            duration_months,
            quantity,
            total_cents,
            optional,
          },
        });
      }

      for (const flatRate of flatRates) {
        await tx.offerFlatRate.create({
          data: {
            offerId: offer.id,
            flatRateId: flatRate.id,
            quantity: flatRate.quantity,
            total_cents: flatRate.total_cents,
          },
        });
      }

      return offer;
    });
    next();
  } catch (exception: any) {
    return response.status(408).json({
      message:
        "Something went wrong trying to create offer: " + exception.message,
      success: false,
    });
  }
};

export const deleteOffer = async (request: Request, response: Response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({
      message: "Bad request",
      success: false,
    });
  }

  if (!id) {
    return response.status(400).json({
      message: "Bad request. Missing id!",
      success: false,
    });
  }

  try {
    await prisma.offer.deleteMany({
      where: { id: id as string },
    });

    return response.status(200).json({
      success: true,
      message: "Successfully deleted offer!",
    });
  } catch (exception: any) {
    return response.status(500).json({
      message: "Something went wrong trying to delete offer!",
      success: false,
    });
  }
};

export const updateOffer = async (request: Request, response: Response, next: NextFunction) => {
  const oid = request.params.id as string;
  const data = request.body;

  if (!data) {
    return response.status(400).json({
      message: 'Bad request! Missing body!'
    });
  }

  const { positions = [], flatRates = [] } = data;
  const { id: _, supplierId, validUntil, requestFrom, date, ...scalarFields } = data.offer;

  for (const position of positions) {
    position["total_cents"] = await calculatePrice({
      productId: position.productId,
      contractId: position.contractId,
      duration: position.duration_months,
      quantity: position.quantity,
      customerId: data.offer?.customerId,
    });
  }

  try {
    const offer = await prisma.$transaction(async (tx) => {
      const net_amount_positions = positions.reduce(
        (sum: number, p: OfferPosition) => sum + p.total_cents, 0);
      const net_amount_flatrates = flatRates.reduce(
        (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);
      const net_amount = net_amount_positions + net_amount_flatrates;

      const offer = await tx.offer.updateManyAndReturn({
        where: { id: oid as string },
        data: {
          ...scalarFields,
          date: toDate(date) ?? new Date(),
          supplierId: supplierId || null,
          validUntil: toDate(validUntil),
          requestFrom: toDate(requestFrom),
          net_amount,
        },
      });

      await tx.offerPosition.deleteMany({ where: { offerId: oid } });
      for (const position of positions) {
        const { productId, contractId, duration_months, quantity, optional, total_cents } = position;
        await tx.offerPosition.create({
          data: { offerId: oid, productId, contractId, duration_months, quantity, total_cents, optional },
        });
      }

      await tx.offerFlatRate.deleteMany({ where: { offerId: oid } });
      for (const flatRate of flatRates) {
        await tx.offerFlatRate.create({
          data: { offerId: oid, flatRateId: flatRate.flatRateId, quantity: flatRate.quantity, total_cents: flatRate.total_cents },
        });
      }

      return offer[0];
    });

    request.body.offer = offer;
    next();
    //return response.status(200).json({});
  } catch (exception: any) {
    console.error('updateOffer error:', exception.message, JSON.stringify(exception, null, 2));
    return response.status(500).json({
      message: 'Something went wrong trying to update offer',
      detail: exception.message,
      exception
    });
  }
}
