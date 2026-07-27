import { z } from "zod";
export declare const languageSchema: z.ZodEnum<{
    DE: "DE";
    EN: "EN";
}>;
export type Language = z.infer<typeof languageSchema>;
//# sourceMappingURL=language.schema.d.ts.map