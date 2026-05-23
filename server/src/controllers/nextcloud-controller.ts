import { Request, Response } from "express";
import {
  checkNextcloudConnection,
  getNextcloudPaths,
  saveNextcloudPaths,
} from "../lib/nextcloud.js";
import { updateNextcloudPathsSchema } from "../schemas/nextcloud-schemas.js";

export const getNextcloudPathsHandler = async (_req: Request, res: Response) => {
  const paths = await getNextcloudPaths();
  return res.status(200).json(paths);
};

export const updateNextcloudPathsHandler = async (req: Request, res: Response) => {
  const result = updateNextcloudPathsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid input", errors: result.error.flatten() });
  }

  const { pdfPath, docxPath } = result.data;
  await saveNextcloudPaths(pdfPath, docxPath);
  return res.status(200).json({ pdfPath, docxPath });
};

export const getNextcloudStatusHandler = async (_req: Request, res: Response) => {
  const result = await checkNextcloudConnection();
  return res.status(200).json(result);
};

