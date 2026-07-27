import { Request, Response } from "express";

import * as flatRateService from "../services/flat-rate.service.js";

/* ========== GET ========== */

export const getFlatRates = async (request: Request, response: Response) => {
    const result = await flatRateService.getFlatRates();
    return response.status(200).json(result);
};

export const getFlatrate = async (request: Request, response: Response) => {
    const flatrateId = request.params.id as string;
    const result = await flatRateService.getFlatrate(flatrateId);
    return response.status(200).json(result);
};

export const getFlatRate = async (request: Request, response: Response) => {
    const flatrate = await flatRateService.getFlatRateById(request.params.id as string);
    return response.status(200).json(flatrate);
};

/* ========== POST ========== */

export const createFlatRate = async (request: Request, response: Response) => {
    const flatrate = await flatRateService.createFlatRate(request.body);
    return response.status(201).json(flatrate);
};

/* ========== UPDATE ========== */

export const updateFlatRate = async (request: Request, response: Response) => {
    const flatrate = await flatRateService.updateFlatRate(
        request.params.id as string,
        request.body,
    );
    return response.status(200).json(flatrate);
};

/* ========== DELETE ========== */

export const deleteFlatRate = async (request: Request, response: Response) => {
    await flatRateService.deleteFlatRate(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted flat rate!",
    });
};
