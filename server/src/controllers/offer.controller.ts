import { Request, Response } from "express";

import * as offerService from "../services/offer/index.js";

/* ========== GET ========== */

export const getOffers = async (request: Request, response: Response) => {
    const result = await offerService.getOffers(request.query);
    return response.status(200).json(result);
};

export const getOfferById = async (request: Request, response: Response) => {
    const offer = await offerService.getOfferById(request.params.id as string);
    return response.status(200).json(offer);
};

export const getNextQuoteId = async (request: Request, response: Response) => {
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
    const offer = await offerService.updateOffer(request.params.id as string, request.body, request.user!.id);
    return response.status(200).json(offer);
};

/* ========== POST ========== */

export const createOffer = async (request: Request, response: Response) => {
    const offer = await offerService.createOffer(request.body, { actorId: request.user!.id });
    return response.status(200).json(offer);
};

export const enqueueGeneration = async (request: Request, response: Response) => {
    const task = await offerService.enqueueGeneration(request.params.id as string);
    return response.status(200).json(task);
};

export const renewOffer = async (request: Request, response: Response) => {
    const offer = await offerService.renewOffer(
        request.params.id as string,
        request.body,
        request.user!.id,
    );
    return response.status(200).json(offer);
};

export const extendOffer = async (request: Request, response: Response) => {
    const offer = await offerService.extendOffer(
        request.params.id as string,
        request.body,
        request.user!.id,
    );
    return response.status(200).json(offer);
};

/**
 * `quantity` wird von Hand konvertiert, weil `validateQuery` das Ergebnis
 * bewusst nicht zurückschreibt — siehe dort. Geprüft ist der Wert zu diesem
 * Zeitpunkt bereits.
 */
export const getExtensionPrice = async (request: Request, response: Response) => {
    const price = await offerService.getExtensionPrice(
        request.params.offerId as string,
        request.params.positionId as string,
        Number(request.query.quantity),
    );
    return response.status(200).json(price);
};
