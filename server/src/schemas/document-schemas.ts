import { z } from "zod";

export const renameDocumentSchema = z.object({
    displayName: z.string().min(1, "displayName required!"),
});
