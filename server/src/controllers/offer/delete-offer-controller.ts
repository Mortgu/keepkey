import { Request, Response } from "express";

import * as offerService from "../../services/offer.service.js";

export const deleteOffer = async (request: Request, response: Response) => {
    await offerService.deleteOffer(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted offer!",
    });
};

export const deleteOfferDocument = async (request: Request, response: Response) => {
    await offerService.deleteOfferDocument(
        request.params.id as string,
        request.params.documentId as string,
    );

    return response.status(200).json({ success: true });
};

export const deleteOfferRevision = async (request: Request, response: Response) => {
    await offerService.deleteOfferRevision(request.params.revisionId as string);

    return response.status(200).json({
        message: "Successfully deleted revision!",
    });
};
