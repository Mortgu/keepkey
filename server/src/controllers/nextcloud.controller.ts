import type {Request, Response} from "express";
import {cloudDirectoryQuerySchema} from "@keepit/schemas";

import * as service from "../services/nextcloud.service.js";

/* ========== GET ========== */

export const getCloudStatus = async (request: Request, response: Response) => {
    const status = service.getCloudStatus();
    return response.status(200).json(status);
};

export const getCloudDirectory = async (request: Request, response: Response) => {
    const {path} = cloudDirectoryQuerySchema.parse(request.query);
    const files = await service.getCloudDirectory(path);
    return response.status(200).json(files);
};

export const getFilesById = async (request: Request, response: Response) => {
    const result = await service.getFilesById(request.params.id as string);
    return response.status(200).json(result);
};

export const getOfferFiles = async (request: Request, response: Response) => {
    const files = await service.getOfferFiles();
    return response.status(200).json(files);
};

export const getOfferFileById = async (request: Request, response: Response) => {
    const result = await service.getOfferFileById(request.params.id as string);
    return response.status(200).json(result);
};

export const getOrderFileById = async (request: Request, response: Response) => {
    const result = await service.getOrderFileById(request.params.id as string);
    return response.status(200).json(result);
};
