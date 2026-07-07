import { Request, Response } from "express";

import { AppException } from "../../lib/exceptions.js";
import * as offerService from "../../services/offer.service.js";

export const updateOffer = async (request: Request, response: Response) => {
    if (!request.body) {
        throw new AppException("Bad request! Missing body!", 400, "MISSING_BODY");
    }

    const offer = await offerService.updateOffer(
        request.params.id as string,
        request.body,
        request.user!.id,
    );

    return response.status(200).json(offer);
};
