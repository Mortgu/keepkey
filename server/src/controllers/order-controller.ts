import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

/*
 * Get all orders
 * [GET] http://localhost:3000/api/admin/orders
 */
export const getAllOrders = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
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

/*
 * [GET] http://localhost:3000/api/orders/:orderId
 */
export const getOrderById = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
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
export const getOrderDocumentJobs = async (
  request: Request,
  response: Response,
) => {
  const { orderId } = request.params;

  const jobs = await prisma.documentJob.findMany({
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
