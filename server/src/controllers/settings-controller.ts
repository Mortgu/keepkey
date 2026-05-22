import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const updateSettings = async (request: Request, response: Response) => {
    const { key, value } = request.body;

    const upsertSetting = await prisma.appSetting.upsert({
        where: { key: key as string },
        update: {
            value: value,
        },
        create: {
            key: key,
            value: value,
        }
    });

    return response.status(200).json(upsertSetting);
}