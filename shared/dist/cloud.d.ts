import { z } from "zod";
export declare const cloudFileSchema: z.ZodObject<{
    filename: z.ZodString;
    basename: z.ZodString;
    lastmod: z.ZodString;
    size: z.ZodNumber;
}, z.core.$strip>;
export type CloudFile = z.infer<typeof cloudFileSchema>;
//# sourceMappingURL=cloud.d.ts.map