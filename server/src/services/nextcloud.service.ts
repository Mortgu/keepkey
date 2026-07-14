import { FileStat } from "webdav";
import {
    downloadDocumentStream,
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
            message: getNextcloudInitError() || "",
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

/* ========== Templates ========== */

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function assertTemplateFilename(filename: string) {
    if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
        throw new AppException("Ungültiger Dateiname!", 400, "INVALID_FILENAME");
    }
    if (!filename.toLowerCase().endsWith(".docx")) {
        throw new AppException("Nur .docx-Dateien sind erlaubt!", 400, "INVALID_FILENAME");
    }
}

function templatePath(filename: string) {
    return `${env.NEXTCLOUD_TEMPLATES_PATH}/${filename}`;
}

export async function getTemplates() {
    const client = getNextCloudClient();
    const files = (await client.getDirectoryContents(env.NEXTCLOUD_TEMPLATES_PATH)) as FileStat[];
    return files.filter((file) => file.type === "file");
}

export async function uploadTemplate(filename: string, content: Buffer) {
    assertTemplateFilename(filename);

    if (!Buffer.isBuffer(content) || content.length === 0) {
        throw new AppException("Bad request!", 400, "EMPTY_FILE");
    }

    const client = getNextCloudClient();
    const created = await client.putFileContents(templatePath(filename), content, { overwrite: false });

    if (!created) {
        throw new AppException("Vorlage existiert bereits!", 409, "TEMPLATE_EXISTS");
    }
}

export async function deleteTemplate(filename: string) {
    assertTemplateFilename(filename);

    const client = getNextCloudClient();
    try {
        await client.deleteFile(templatePath(filename));
    } catch (exception: any) {
        if (exception?.status === 404 || exception?.response?.status === 404) {
            throw new AppException("Vorlage nicht gefunden!", 404, "TEMPLATE_NOT_FOUND");
        }
        throw exception;
    }
}

export async function downloadTemplate(filename: string) {
    assertTemplateFilename(filename);

    return {
        stream: await downloadDocumentStream(templatePath(filename)),
        downloadName: filename,
        contentType: DOCX_MIME,
    };
}
