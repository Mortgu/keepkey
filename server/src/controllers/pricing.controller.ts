import { Request, Response } from "express";

import * as service from '../services/pricing.service.js';

export const getPinnedPrice = async (request: Request, response: Response) => {
    const { customerId, positionId, duration, quantity, free_months } = request.query;

    const result = await service.getPinnedPrice({
        customerId: String(customerId),
        positionId: String(positionId),
        duration: Number(duration),
        quantity: Number(quantity),
        free_months: Number(free_months)
    });

    return response.status(200).json(result);
}

export const getLivePrice = async (request: Request, response: Response) => {
    const { customerId, productId, contractId, duration, quantity, free_months } = request.query;

    const result = await service.getLivePrice({
        customerId: String(customerId),
        productId: String(productId),
        contractId: String(contractId),
        duration: Number(duration),
        quantity: Number(quantity),
        free_months: Number(free_months),
    });

    return response.status(200).json(result);
}

export const upsertOverride = async (request: Request, response: Response) => {
    const result = await service.upsertOverride(request.body);
    return response.status(200).json(result);
}

export const deleteOverride = async (request: Request, response: Response) => {
    const { productId, contractId, duration, quantity, customerId } = request.query;

    const result = await service.deleteOverride({
        productId: String(productId),
        contractId: String(contractId),
        duration: Number(duration),
        quantity: Number(quantity),
        customerId: String(customerId)
    });

    return response.status(200).json(result);
}