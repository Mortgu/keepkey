import { Request, Response } from "express";

import * as offerService from "../../services/offer.service.js";

export const createOffer = async (request: Request, response: Response) => {
    const offer = await offerService.createOffer(request.body);
    return response.status(200).json(offer);
};

export const createOfferPositions = async (request: Request, response: Response) => {
    const positions = await offerService.createOfferPositions(request.params.id as string, request.body);
    return response.status(200).json(positions);
};

export const createOfferFlatrates = async (request: Request, response: Response) => {
    const flatrates = await offerService.createOfferFlatrates(request.params.id as string, request.body);
    return response.status(200).json(flatrates);
};

export const enqueueGeneration = async (request: Request, response: Response) => {
    const task = await offerService.enqueueGeneration(request.params.id as string);
    return response.status(200).json(task);
};

export const uploadOfferDocument = async (request: Request, response: Response) => {
    const { id, documentId } = request.params;
    const result = await offerService.uploadOfferDocument(id as string, documentId as string);
    return response.status(200).json(result);
};
