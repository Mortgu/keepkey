import type {Request, Response} from "express";

import * as service from "../services/confirmation.service.js";

export const getConfirmation = async (request: Request, response: Response) => {
    const confirmation = await service.getConfirmationByOrder(request.params.orderId as string);
    return response.status(200).json(confirmation);
};

export const createConfirmation = async (request: Request, response: Response) => {
    const confirmation = await service.createConfirmation(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(201).json(confirmation);
};

export const regenerateConfirmation = async (request: Request, response: Response) => {
    const task = await service.regenerateConfirmation(request.params.orderId as string);
    return response.status(200).json(task);
};

export const deleteConfirmation = async (request: Request, response: Response) => {
    await service.deleteConfirmation(request.params.orderId as string);
    return response.status(204).send();
};
