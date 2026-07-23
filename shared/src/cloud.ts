import z from "zod";

export const cloudFileSchema = z.object({
  filename: z.string(),
  basename: z.string(),
  lastmod: z.string(),
  size: z.number(),
});

export type CloudFile = z.infer<typeof cloudFileSchema>;
