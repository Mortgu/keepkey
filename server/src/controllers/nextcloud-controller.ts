import { Request, Response } from "express";
import { getNextCloudClient, reserveFile } from "../lib/nextcloud.js";
import env from "../lib/env.js";
import logger from "../middlewares/logger.js";

export const getNextcloudStatus = async (request: Request, response: Response) => {
    if (!env.NEXTCLOUD_URL || !env.NEXTCLOUD_USER || !env.NEXTCLOUD_PASSWORD) {
        return response.status(404).json({
            message: 'NextCloud not configured!',
        });
    }

    try {
        const client = getNextCloudClient();
        await client.getDirectoryContents("/");

        return response.status(200).json({
            message: 'ok'
        });
    } catch (exception: any) {
        return response.status(500).json({
            message: 'NextCloud connection could now be established!'
        });
    }
};

export async function reserveQuoteIdForOffer(quoteId: string): Promise<void> {
    try {
        await reserveFile(quoteId, env.NEXTCLOUD_OFFER_PDF_PATH);
        await reserveFile(quoteId, env.NEXTCLOUD_OFFER_ORIGINAL_PATH);
        logger.info(`[nextcloud] reservations created for quote ${quoteId}`);
    } catch (exception: any) {
        throw new Error(
            `NextCloud reservation failed for quote ${quoteId}: ${exception.message}`,
        );
    }
}