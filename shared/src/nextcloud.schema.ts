import { z } from "zod";

export const cloudFileMetadataSchema = z.object({
    basename: z.string(),
    filename: z.string(),
    size: z.number(),
    lastmod: z.string(),
    mime: z.string().nullable(),
});
export type CloudFileMetadata = z.infer<typeof cloudFileMetadataSchema>;

/* Treffer einer Suche nach der Dokument-ID: pro Verzeichnis-Label die dort
   gefundenen Dateien. `found` ist false, wenn kein Verzeichnis etwas geliefert hat. */
export const findFilesByIdResultSchema = z.object({
    id: z.string(),
    found: z.boolean(),
    files: z.record(z.string(), z.array(cloudFileMetadataSchema)),
});
export type FindFilesByIdResult = z.infer<typeof findFilesByIdResultSchema>;
