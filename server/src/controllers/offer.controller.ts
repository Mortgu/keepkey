import { NextFunction, Request, Response } from "express";

import * as offerService from "../services/offer.service.js";

/* ========== GET ========== */

export const getOffers = async (request: Request, response: Response) => {
    const result = await offerService.getOffers(request.query);
    return response.status(200).json(result);
};

export const getOfferById = async (request: Request, response: Response) => {
    const offer = await offerService.getOfferById(request.params.id as string);
    return response.status(200).json(offer);
};

export const getOfferRevisions = async (request: Request, response: Response) => {
    const revisions = await offerService.getOfferRevisions(request.params.id as string);
    return response.status(200).json(revisions);
};

export const getNextQuoteId = async (request: Request, response: Response, next: NextFunction) => {
    const quoteId = await offerService.getNextQuoteId();
    return response.status(200).json(quoteId);
};

/* ========== DELETE ========== */

export const deleteOffer = async (request: Request, response: Response) => {
    await offerService.deleteOffer(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};

/* ========== UPDATE ========== */

export const updateOffer = async (request: Request, response: Response) => {
    const offerId = request.params.id as string;

    const offer = await offerService.updateOffer(offerId, request.body, request.user!.id);
    return response.status(200).json(offer);
};

/* ========== POST ========== */

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

export const restoreOfferRevision = async (request: Request, response: Response) => {
    const offer = await offerService.restoreOfferRevision(
        request.params.id as string,
        request.params.revisionId as string,
        request.body.expectedVersion,
        request.user!.id,
    );
    return response.status(200).json(offer);
};
