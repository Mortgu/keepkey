import type {NextFunction, Request, Response} from "express";
import {AppException} from "../lib/exceptions.js";

import * as service from "../services/order.service.js";

/* ========== GET ========== */

export const getAllOrders = async (request: Request, response: Response) => {
    const orders = await service.getAllOrders(request.query);
    return response.status(200).json(orders);
};

export const getNextOrderNumber = async (request: Request, response: Response) => {
    const orderId = await service.getNextOrderNumber();
    return response.status(200).json({orderId});
};

export const getOrderById = async (request: Request, response: Response) => {
    const order = await service.getOrderById(request.params.orderId as string);
    return response.status(200).json(order);
};

/* ========== POST ========== */

export const createOrder = async (request: Request, response: Response, next: NextFunction) => {
    const order = await service.createOrder(request.body, request.user!.id);
    response.locals.order = order;
    next();
};

export const createOrderTask = async (request: Request, response: Response) => {
    const order = response.locals.order;

    if (!order) {
        throw new AppException("Failed to create order task. Missing order!", 404, "MISSING_ORDER");
    }

    await service.createOrderTask(order.id);
    return response.status(200).json(order);
};

export const generateOrderDocument = async (request: Request, response: Response) => {
    const task = await service.generateOrderDocument(request.params.orderId as string);
    return response.status(200).json({taskId: task.id});
};

/* ========== PATCH ========== */

export const updateOrder = async (request: Request, response: Response) => {
    const order = await service.updateOrder(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(200).json(order);
};

/* ========== DELETE ========== */

export const deleteOrderById = async (request: Request, response: Response) => {
    await service.deleteOrderById(request.params.id as string);
    return response.status(200).json({message: "Deletion successfully", success: true});
};

export const cancelOrder = async (request: Request, response: Response) => {
    const order = await service.cancelOrder(request.params.orderId as string, request.body.expectedVersion, request.user!.id);
    return response.status(200).json(order);
};
