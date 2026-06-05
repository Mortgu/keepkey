import { Request, Response } from "express";
import env from "../lib/env.js";
import { getNextCloudClient } from "../lib/nextcloud.js";
import logger from "../middlewares/logger.js";

export const getNextcloudStatus = async (request: Request, response: Response) => {
  if (!env.NEXTCLOUD_URL || !env.NEXTCLOUD_USER || !env.NEXTCLOUD_PASSWORD) {
    return response.status(404).json({
      message: "NextCloud not configured!",
    });
  }

  const client = getNextCloudClient();

  try {
    await client.getDirectoryContents("/");
    return response.status(200).json({
      message: "ok"
    });
  } catch (exception: any) {
    logger.error(exception);
    return response.status(500).json({
      message: "NextCloud connection could not be established!"
    });
  }
};
