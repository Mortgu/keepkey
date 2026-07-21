import z from "zod";

const CloudFile = z.object({
    filename: z.string(),
    basename: z.string(),
    lastmod: z.string(),
    size: z.number(),
});

export type CloudFile = z.infer<typeof CloudFile>;