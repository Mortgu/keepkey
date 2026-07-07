import {
    findFilesById,
    getNextCloudClient,
    getNextcloudInitError,
    isNextcloudAvailable,
    isNextcloudConfigured,
} from "../lib/nextcloud.js";
import env from "../lib/env.js";
import { AppException } from "../lib/exceptions.js";

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

/* ========== Types ========== */

export interface CloudStatus {
    configured: boolean;
    available: boolean;
    message: string;
}

/* ========== Queries ========== */

export function getCloudStatus(): CloudStatus {
    const configured = isNextcloudConfigured();

    if (!configured) {
        return {
            configured: false,
            available: false,
            message: "Nextcloud is not configured. Set NEXTCLOUD_URL, NEXTCLOUD_USER, and NEXTCLOUD_PASSWORD.",
        };
    }

    if (!isNextcloudAvailable) {
        return {
            configured: true,
            available: false,
            message: getNextcloudInitError(),
        };
    }

    return {
        configured: true,
        available: true,
        message: "ok",
    };
}

export async function getCloudDirectory(path: string) {
    if (!path) {
        throw new AppException("Bad request!", 400, "MISSING_PATH");
    }

    const client = getNextCloudClient();
    const files = await client.getDirectoryContents(path);

    return files;
}

export async function getFilesById(id: string) {
    return findFilesById(id, ALL_DIRECTORIES);
}

export async function getOfferFiles() {
    const client = getNextCloudClient();

    const pdf_files = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_PDF_PATH);
    const docx_files = await client.getDirectoryContents(env.NEXTCLOUD_OFFER_ORIGINAL_PATH);

    return { pdf_files, docx_files };
}

export async function getOfferFileById(id: string) {
    return findFilesById(id, OFFER_DIRECTORIES);
}

export async function getOrderFileById(id: string) {
    return findFilesById(id, ORDER_DIRECTORIES);
}
