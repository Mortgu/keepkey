import { Request, Response } from "express";
import {
  getNextCloudClient,
} from "../lib/nextcloud.js";
import env from "../lib/env.js";
import logger from "../middlewares/logger.js";
import { AppException } from "../exceptions/exceptions.js";

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

export async function reserveQuoteIdInNextCloud(quoteId: string) {
  try {
    const buffer = new ArrayBuffer(0);
    await getNextCloudClient().putFileContents(`${quoteId}.reserved`, buffer);

    logger.info('Reservation successfull');
  } catch (exception: any) {
    throw new AppException(
      `NextCloud reservation failed for ${quoteId}`,
      exception?.status,
      exception,
    )
  }
}