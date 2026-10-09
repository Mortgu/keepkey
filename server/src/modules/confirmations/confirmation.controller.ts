import { Request, Response } from "express";
import * as confirmationService from "./confirmation.service.js";

export const getConfirmation = async (request: Request, response: Response) => {
    const confirmation = await confirmationService.getConfirmationByOrder(request.params.orderId as string);
    return response.status(200).json(confirmation);
};

export const createConfirmation = async (request: Request, response: Response) => {
    const confirmation = await confirmationService.createConfirmation(
        request.params.orderId as string,
        request.body,
        request.user!.id,
    );
    return response.status(201).json(confirmation);
};

export const regenerateConfirmation = async (request: Request, response: Response) => {
    const task = await confirmationService.regenerateConfirmation(request.params.orderId as string);
    return response.status(200).json(task);
};
