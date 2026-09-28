import { z } from "zod";
export declare const cloudFileSchema: z.ZodObject<{
    filename: z.ZodString;
    basename: z.ZodString;
    lastmod: z.ZodString;
    size: z.ZodNumber;
}, z.core.$strip>;
export type CloudFile = z.infer<typeof cloudFileSchema>;
/** Query des Verzeichnis-Endpunkts (`GET /api/cloud/directory?path=…`). */
export declare const cloudDirectoryQuerySchema: z.ZodObject<{
    path: z.ZodString;
}, z.core.$strip>;
export type CloudDirectoryQuery = z.infer<typeof cloudDirectoryQuerySchema>;
//# sourceMappingURL=cloud.d.ts.map