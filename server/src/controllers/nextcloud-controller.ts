import {Request, Response} from "express";
import {
    findFilesById,
    getNextCloudClient,
    getNextcloudInitError,
    isNextcloudAvailable,
    isNextcloudConfigured,
} from "../lib/nextcloud.js";
import env from "../lib/env.js";

const ALL_DIRECTORIES = [
    { path: env.NEXTCLOUD_OFFER_PDF_PATH, label: "offer_pdf" },
    { path: env.NEXTCLOUD_OFFER_ORIGINAL_PATH, label: "offer_original" },
    { path: env.NEXTCLOUD_ORDER_PDF_PATH, label: "order_pdf" },
    { path: env.NEXTCLOUD_ORDER_ORIGINAL_PATH, label: "order_original" },
];

const OFFER_DIRECTORIES = [
    { path: env.NEXTCLOUD_OFFER_PDF_PATH, label: "offer_pdf" },
    { path: env.NEXTCLOUD_OFFER_ORIGINAL_PATH, label: "offer_original" },
];

const ORDER_DIRECTORIES = [
    { path: env.NEXTCLOUD_ORDER_PDF_PATH, label: "order_pdf" },
    { path: env.NEXTCLOUD_ORDER_ORIGINAL_PATH, label: "order_original" },
];

export const getCloudStatus = async (request: Request, response: Response) => {
    const configured = isNextcloudConfigured();

    if (!configured) {
        return response.status(200).json({
            configured: false,
            available: false,
            message: "Nextcloud is not configured. Set NEXTCLOUD_URL, NEXTCLOUD_USER, and NEXTCLOUD_PASSWORD.",
        });
    }

    if (!isNextcloudAvailable) {
        return response.status(200).json({
            configured: true,
            available: false,
            message: getNextcloudInitError(),
        });
    }

    return response.status(200).json({
        configured: true,
        available: true,
        message: "ok",
    });
};

export const getFilesById = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    try {
        const result = await findFilesById(id, ALL_DIRECTORIES);
        return response.status(200).json(result);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Something went wrong trying to find files",
            error: exception.message,
        });
    }
};

export const getOfferFiles = async (request: Request, response: Response) => {
    const client = getNextCloudClient();

    try {
        const pdf_files = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_PDF_PATH);
        const docx_files = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_ORIGINAL_PATH);

        return response.status(200).json({
            pdf_files, docx_files,
        });
    } catch (error: any) {
        return response.status(400).json({
            message: "Something went wrong trying to retrieve files",
            error: error.message,
        });
    }
};

export const getOfferFileById = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    try {
        const result = await findFilesById(id, OFFER_DIRECTORIES);
        return response.status(200).json(result);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Something went wrong trying to find offer files",
            error: exception.message,
        });
    }
};

export const getOrderFileById = async (request: Request, response: Response) => {
    const id = request.params.id as string;

    try {
        const result = await findFilesById(id, ORDER_DIRECTORIES);
        return response.status(200).json(result);
    } catch (exception: any) {
        return response.status(400).json({
            message: "Something went wrong trying to find order files",
            error: exception.message,
        });
    }
};
