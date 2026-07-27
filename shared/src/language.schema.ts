import { z } from "zod";

export const languageSchema = z.enum(["DE", "EN"]);

export type Language = z.infer<typeof languageSchema>;