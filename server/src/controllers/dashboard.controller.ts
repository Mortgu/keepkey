import { Request, Response } from "express";
import { getDashboardStats } from "../services/dashboard.service.js";

export const getStats = async (_request: Request, response: Response) => {
    const stats = await getDashboardStats();
    return response.status(200).json(stats);
};
