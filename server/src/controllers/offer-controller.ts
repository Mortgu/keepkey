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

export const getOffers = async (request: Request, response: Response) => {
  const offers = await prisma.offer.findMany({
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
        documents: true,
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
    // 1. Create task in db
    const task = await prisma.task.create({
      data: {
        offerId: offer.id,
        type: TaskType.OFFER,
        status: TaskStatus.PENDING,
      },
    });

    // 2. Create a new document (pdf, docx) in db
    await prisma.document.updateMany({
      where: { AND: [{ offerId: offer.id }, { isCurrent: true }] },
      data: {
        isCurrent: false
      }
    });

    await prisma.document.create({
      data: {
        offerId: offer.id,
        status: "PENDING",
        isCurrent: true
      }
    })

    // 3. Enqueue the job for bullmq
    const job = await documentQueue.add(documentQueueKey, {
      taskId: task.id,
      taskType: TaskType.OFFER,
    });

    // 4. Update the task to include the id of the enqued job
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
      ...position,
    });
  }

  try {
    request.body.offer = await prisma.$transaction(async (tx) => {
      let net_amount_positions = positions.reduce(
        (sum: number, p: OfferPosition) => sum + p.total_cents, 0);

      let net_amount_flatrates = flatRates.reduce(
        (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);

      let net_amount = net_amount_positions + net_amount_flatrates;

      const toDate = (val: string | null | undefined): Date | null => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      };

      const { supplierId, validUntil, requestFrom, date, ...offerFields } = body.offer;
      const offer = await tx.offer.create({
        data: {
          ...offerFields,
          date: toDate(date) ?? new Date(),
          supplierId: supplierId || null,
          validUntil: toDate(validUntil),
          requestFrom: toDate(requestFrom),
          net_amount: net_amount,
          tax_rate: 19,
          tax_amount: net_amount * 0.19,
          total_amount: net_amount * 1.19,
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
            tax_rate: 19,
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

export const updateOffer = async (request: Request, response: Response) => {
  const oid = request.params.id as string;
  const data = request.body;

  if (!data) {
    return response.status(400).json({
      message: 'Bad request! Missing body!'
    });
  }

  const toDate = (val: string | null | undefined): Date | null => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const { positions = [], flatRates = [] } = data;
  const { id: _, supplierId, validUntil, requestFrom, date, ...scalarFields } = data.offer;

  for (const position of positions) {
    position["total_cents"] = await calculatePrice({ ...position });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const net_amount_positions = positions.reduce(
        (sum: number, p: OfferPosition) => sum + p.total_cents, 0);
      const net_amount_flatrates = flatRates.reduce(
        (sum: number, p: OfferFlatRate) => sum + p.total_cents, 0);
      const net_amount = net_amount_positions + net_amount_flatrates;

      await tx.offer.updateMany({
        where: { id: oid as string },
        data: {
          ...scalarFields,
          date: toDate(date) ?? new Date(),
          supplierId: supplierId || null,
          validUntil: toDate(validUntil),
          requestFrom: toDate(requestFrom),
          net_amount,
          tax_rate: 19,
          tax_amount: net_amount * 0.19,
          total_amount: net_amount * 1.19,
        },
      });

      await tx.offerPosition.deleteMany({ where: { offerId: oid } });
      for (const position of positions) {
        const { productId, contractId, duration_months, quantity, optional, total_cents } = position;
        await tx.offerPosition.create({
          data: { offerId: oid, productId, contractId, duration_months, quantity, total_cents, optional, tax_rate: 19 },
        });
      }

      await tx.offerFlatRate.deleteMany({ where: { offerId: oid } });
      for (const flatRate of flatRates) {
        await tx.offerFlatRate.create({
          data: { offerId: oid, flatRateId: flatRate.flatRateId, quantity: flatRate.quantity, total_cents: flatRate.total_cents },
        });
      }
    });

    return response.status(200).json({});
  } catch (exception: any) {
    console.error('updateOffer error:', exception.message, JSON.stringify(exception, null, 2));
    return response.status(500).json({
      message: 'Something went wrong trying to update offer',
      detail: exception.message,
      exception
    });
  }
}
