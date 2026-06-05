import { Request, Response } from "express";
import env from "../lib/env.js";
import { nextCloudRepository } from "../repositories/index.js";

export const getNextcloudStatus = async (request: Request, response: Response) => {
  if (!env.NEXTCLOUD_URL || !env.NEXTCLOUD_USER || !env.NEXTCLOUD_PASSWORD) {
    return response.status(404).json({
      message: "NextCloud not configured!",
    });
  }

  const connected = await nextCloudRepository.checkConnection();
  if (connected) {
    return response.status(200).json({ message: "ok" });
  }
  return response.status(500).json({ message: "NextCloud connection could not be established!" });
};
