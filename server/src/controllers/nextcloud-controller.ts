import { Request, Response } from "express";
import {
    isNextcloudConfigured,
    isNextcloudAvailable,
    getNextcloudInitError,
} from "../lib/nextcloud.js";

export const getNextcloudStatus = async (request: Request, response: Response) => {
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