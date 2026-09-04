import { Request, Response } from "express";

import * as nextcloudService from "../services/nextcloud.service.js";

/* ========== GET ========== */

export const getCloudStatus = async (request: Request, response: Response) => {
    const status = nextcloudService.getCloudStatus();
    return response.status(200).json(status);
};

export const getCloudDirectory = async (request: Request, response: Response) => {
    const path = request.query.path as string;
    const files = await nextcloudService.getCloudDirectory(path);
    return response.status(200).json(files);
};

export const getFilesById = async (request: Request, response: Response) => {
    const result = await nextcloudService.getFilesById(request.params.id as string);
    return response.status(200).json(result);
};

export const getOfferFiles = async (request: Request, response: Response) => {
    const files = await nextcloudService.getOfferFiles();
    return response.status(200).json(files);
};

export const getOfferFileById = async (request: Request, response: Response) => {
    const result = await nextcloudService.getOfferFileById(request.params.id as string);
    return response.status(200).json(result);
};

export const getOrderFileById = async (request: Request, response: Response) => {
    const result = await nextcloudService.getOrderFileById(request.params.id as string);
    return response.status(200).json(result);
};
