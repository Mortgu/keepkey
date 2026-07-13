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

/* ========== Templates ========== */

export const getTemplates = async (request: Request, response: Response) => {
    const templates = await nextcloudService.getTemplates();
    return response.status(200).json(templates);
};

export const uploadTemplate = async (request: Request, response: Response) => {
    const filename = request.query.filename as string;
    await nextcloudService.uploadTemplate(filename, request.body as Buffer);

    return response.status(201).json({
        success: true,
        message: "Successfully uploaded template!",
    });
};

export const downloadTemplate = async (request: Request, response: Response) => {
    const download = await nextcloudService.downloadTemplate(request.params.filename as string);

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Disposition", `attachment; filename="${download.downloadName}"`);

    download.stream.pipe(response);
};

export const deleteTemplate = async (request: Request, response: Response) => {
    await nextcloudService.deleteTemplate(request.params.filename as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted template!",
    });
};
