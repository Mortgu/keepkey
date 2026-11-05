import type {Request, Response} from "express";

import * as service from "../services/offer/index.js";

/* ========== GET ========== */

export const getOffers = async (request: Request, response: Response) => {
    const result = await service.getOffers(request.query);
    return response.status(200).json(result);
};

export const getOfferById = async (request: Request, response: Response) => {
    const offer = await service.getOfferById(request.params.id as string);
    return response.status(200).json(offer);
};

/* ========== DELETE ========== */

export const deleteOffer = async (request: Request, response: Response) => {
    await service.deleteOffer(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};

/* ========== UPDATE ========== */

export const updateOffer = async (request: Request, response: Response) => {
    const offer = await service.updateOffer(request.params.id as string, request.body, request.user!.id);
    return response.status(200).json(offer);
};

/* ========== POST ========== */

export const createOffer = async (request: Request, response: Response) => {
    const offer = await service.createOffer(request.body, {actorId: request.user!.id});
    return response.status(200).json(offer);
};

export const enqueueGeneration = async (request: Request, response: Response) => {
    const task = await service.enqueueGeneration(request.params.id as string);
    return response.status(200).json(task);
};

export const renewOffer = async (request: Request, response: Response) => {
    const offer = await service.renewOffer(
        request.params.id as string,
        request.body,
        request.user!.id,
    );
    return response.status(200).json(offer);
};

export const extendOffer = async (request: Request, response: Response) => {
    const offer = await service.extendOffer(request.params.id as string, request.body);
    return response.status(200).json(offer);
};

/**
 * `quantity` wird von Hand konvertiert, weil `validateQuery` das Ergebnis
 * bewusst nicht zurückschreibt — siehe dort. Geprüft ist der Wert zu diesem
 * Zeitpunkt bereits.
 */
export const getExtensionPrice = async (request: Request, response: Response) => {
    const price = await service.getExtensionPrice(
        request.params.offerId as string,
        request.params.positionId as string,
        Number(request.query.quantity),
    );
    return response.status(200).json(price);
};
