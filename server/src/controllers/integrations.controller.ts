import { Request, Response } from "express";
import { getIntegrationStatus } from "../services/integration.service.js";

export const getStatus = async (_request: Request, response: Response) => {
    const status = await getIntegrationStatus();
    return response.status(200).json(status);
};
