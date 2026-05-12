import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";
import { toDate } from "../utils/utils.js";
import { disconnect } from "node:cluster";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders
 */
export const getAllOrders = async (request: Request, response: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      orderPositions: {
        include: {
          product: true,
          contract: true,
        },
      },
    },
  });

  return response.status(200).json(orders);
};

export const createOrder = async (request: Request, response: Response) => {
  const { id } = request.body;

  const existingOffer = await prisma.offer.findUnique({
    where: { id: id as string },
    include: {
      offerPositions: true,
      offerFlatRates: true,
    }
  });

  if (!existingOffer) {
    return response.status(404).json({
      message: 'Offer not found!'
    });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const order = await prisma.order.create({
        data: {
          orderId: existingOffer.quoteId,
          date: new Date(),
          paymentTerm: existingOffer.paymentTerm,
          projectId: '/', // TODO:

          customerId: existingOffer.customerId,
          supplierId: existingOffer.supplierId,
          offerId: existingOffer.id,
          contactPersonId: existingOffer.contactPersonId,
          employeeId: existingOffer.userId,
        }
      });

      await prisma.orderPosition.createMany({
        data: existingOffer.offerPositions.map((offerPosition) => ({
          orderId: order.id,
          productId: offerPosition.productId,
          contractId: offerPosition.contractId,
          duration_months: offerPosition.duration_months,
          quantity: offerPosition.quantity,

          unit_price: 0,
          discount: 0,
          total: offerPosition.total_cents,
        }))
      });

      return order;
    });

    return response.status(200).json(order);
  } catch (exception: any) {
    return response.status(500).json({
      message: 'Something went wrong trying to create order from offer!',
    });
  }
}

/*
 * [GET] http://localhost:3000/api/orders/:orderId
 */
export const getOrderById = async (request: Request, response: Response) => {
  const { orderId } = request.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId as string },
    include: {
      customer: true,
      orderPositions: {
        include: {
          product: true,
          contract: true,
        },
      },
    },
  });

  return response.status(200).json(order);
};

/*
 * Get document jobs for an order
 * [GET] http://localhost:3000/api/orders/:orderId/documents
 */
export const getOrderTasks = async (request: Request, response: Response) => {
  const { orderId } = request.params;

  const jobs = await prisma.task.findMany({
    where: { orderId: orderId as string },
    orderBy: { createdAt: "desc" },
  });

  return response.status(200).json(jobs);
};

export const deleteOrderById = async (request: Request, response: Response) => {
  const { id } = request.params;

  await prisma.order.delete({
    where: { id: id as string },
  });

  return response.status(200).send({
    message: "Deletion successfully",
    success: true,
  });
};
