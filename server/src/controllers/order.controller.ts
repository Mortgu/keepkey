import { NextFunction, Request, Response } from "express";
import { AppException } from "../lib/exceptions.js";

import * as orderService from "../services/order.service.js";

/* ========== GET ========== */

export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await orderService.getAllOrders();
    return response.status(200).json(orders);
};

export const getNextOrderNumber = async (request: Request, response: Response) => {
    const orderId = await orderService.getNextOrderNumber();
    return response.status(200).json({ orderId });
};

export const getOrderById = async (request: Request, response: Response) => {
    const order = await orderService.getOrderById(request.params.orderId as string);
    return response.status(200).json(order);
};

export const getOrderRevisions = async (request: Request, response: Response) => {
    const revisions = await orderService.getOrderRevisions(request.params.orderId as string);
    return response.status(200).json(revisions);
};

export const downloadOrderDocument = async (request: Request, response: Response) => {
    const orderId = request.params.orderId as string;
    const documentId = request.params.documentId as string;
    const format = (request.params.format as string).toLowerCase();

    const download = await orderService.downloadOrderDocument(orderId, documentId, format);

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Disposition", `attachment; filename="${download.downloadName}"`);

    if (download.kind === "stream") {
        download.stream.pipe(response);
        return;
    }

    return response.download(download.filePath, download.downloadName);
};

/* ========== POST ========== */

export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const order = await orderService.createOrder(request.body);
    response.locals.order = order;
    next();
};

export const createOrderTask = async (request: Request, response: Response) => {
    const order = response.locals.order;

    if (!order) {
        throw new AppException("Failed to create order task. Missing order!", 404, "MISSING_ORDER");
    }

    await orderService.createOrderTask(order.id);
    return response.status(200).json(order);
};

export const generateOrderDocument = async (request: Request, response: Response) => {
    const task = await orderService.generateOrderDocument(request.params.orderId as string);
    return response.status(200).json({ taskId: task.id });
};

export const uploadOrderDocument = async (request: Request, response: Response) => {
    const { orderId, documentId } = request.params;
    const result = await orderService.uploadOrderDocument(orderId as string, documentId as string);
    return response.status(200).json(result);
};

export const restoreOrderRevision = async (request: Request, response: Response) => {
    const order = await orderService.restoreOrderRevision(
        request.params.orderId as string,
        request.params.revisionId as string,
        request.body.expectedVersion,
        request.user!.id,
    );
    return response.status(200).json(order);
};

/* ========== PATCH ========== */

export const updateOrder = async (request: Request, response: Response) => {
    const order = await orderService.updateOrder(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(200).json(order);
};

/* ========== DELETE ========== */

export const deleteOrderById = async (request: Request, response: Response) => {
    await orderService.deleteOrderById(request.params.id as string);
    return response.status(200).json({ message: "Deletion successfully", success: true });
};
