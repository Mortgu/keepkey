import {createClient, type WebDAVClient} from "webdav";
import env from "./env.js";
import logger from "../middlewares/logger.js";
import path from "path";
import {AppException} from "../exceptions/exceptions.js";

let client: WebDAVClient | null = null;
export let isNextcloudAvailable = false;
let nextcloudInitError: string | null = null;

export function isNextcloudConfigured(): boolean {
    return Boolean(env.NEXTCLOUD_URL && env.NEXTCLOUD_USER && env.NEXTCLOUD_PASSWORD);
}

export function getNextcloudInitError(): string | null {
    return nextcloudInitError;
}

export async function initNextcloud(): Promise<boolean> {
    if (!isNextcloudConfigured()) {
        nextcloudInitError = "Nextcloud is not configured. Set NEXTCLOUD_URL, NEXTCLOUD_USER, and NEXTCLOUD_PASSWORD.";
        isNextcloudAvailable = false;
        return false;
    }

    try {
        const testClient = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`, {
            username: env.NEXTCLOUD_USER,
            password: env.NEXTCLOUD_PASSWORD,
        });
        await testClient.getDirectoryContents("/");
        isNextcloudAvailable = true;
        nextcloudInitError = null;
        logger.info("[nextcloud] connection established");
        return true;
    } catch (exception: any) {
        isNextcloudAvailable = false;
        nextcloudInitError = `Nextcloud connection failed: ${exception.message}`;
        logger.error(`[nextcloud] ${nextcloudInitError}`);
        return false;
    }
}

export function getNextCloudClient(): WebDAVClient {
    if (!isNextcloudConfigured()) {
        throw new AppException("Nextcloud is not configured!", 503, "nextcloudNotConfigured");
    }
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "nextcloudUnavailable");
    }
    if (!client) {
        client = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`, {
            username: env.NEXTCLOUD_USER,
            password: env.NEXTCLOUD_PASSWORD,
        });
    }
    return client;
}

export async function fileExists(filePath: string): Promise<boolean> {
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "nextcloudUnavailable");
    }
    try {
        await getNextCloudClient().stat(filePath);
        return true;
    } catch {
        return false;
    }
}

interface ReserveFileResult {
    path: string;
    filename: string;
}

export async function reserveFile(quoteId: string, directoryPath: string): Promise<ReserveFileResult> {
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "nextcloudUnavailable");
    }

    const filePath = path.join(directoryPath, `${quoteId}.reserved`);

    const exists = await fileExists(filePath);

    if (exists) {
        logger.info(`[nextcloud] reservation file already exists: ${filePath}`);
        throw new AppException("Reservation file already exists!", 409, "reserveFile");
    }

    try {
        await getNextCloudClient().putFileContents(filePath, new ArrayBuffer(0));
        logger.info(`[nextcloud] reservation file created: ${path}`);

        return {
            path: directoryPath,
            filename: `${quoteId}.reserved`,
        }
    } catch (exception: any) {
        throw new AppException(
            `NextCloud directory "${directoryPath}" not found or unreachable: ${exception.message}`,
            503,
            "reserveFile",
        );
    }
}

export async function uploadFile(
    filePath: string,
    buffer: Buffer,
): Promise<void> {
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "nextcloudUnavailable");
    }

    const exists = await fileExists(filePath);
    if (exists) {
        throw new AppException(`File already exists in NextCloud: ${filePath}`, 409, "uploadFile");
    }

    try {
        await getNextCloudClient().putFileContents(filePath, buffer);
        logger.info(`[nextcloud] file uploaded: ${filePath}`);
    } catch (exception: any) {
        throw new AppException(
            `NextCloud upload to "${filePath}" failed: ${exception.message}`,
            500,
            "uploadFile",
        );
    }
}