import { z } from "zod";

export const updateNextcloudPathsSchema = z.object({
  pdfPath: z.string().min(1),
  docxPath: z.string().min(1),
});
