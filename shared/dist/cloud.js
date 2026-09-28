import { z } from "zod";
export const cloudFileSchema = z.object({
    filename: z.string(),
    basename: z.string(),
    lastmod: z.string(),
    size: z.number(),
});
/** Query des Verzeichnis-Endpunkts (`GET /api/cloud/directory?path=…`). */
export const cloudDirectoryQuerySchema = z.object({
    path: z.string().min(1),
});
//# sourceMappingURL=cloud.js.map