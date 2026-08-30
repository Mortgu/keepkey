import { z } from "zod";

export const cloudFileMetadataSchema = z.object({
    basename: z.string(),
    filename: z.string(),
    size: z.number(),
    lastmod: z.string(),
    mime: z.string().nullable(),
});
export type CloudFileMetadata = z.infer<typeof cloudFileMetadataSchema>;

export const cloudFileSchema = z.object({

});
export type CloudFile = z.infer<typeof cloudFileSchema>;