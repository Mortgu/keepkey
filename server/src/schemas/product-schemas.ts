import { z } from "zod";

const productTranslationSchema = z.object({
  language: z.enum(["DE", "EN"]),
  name: z.string().min(1),
  description: z.string().optional(),
  table: z.string().optional(),
});

export const createProductSchema = z.object({
  translations: z.array(productTranslationSchema).min(1),
});

export const updateProductSchema = z.object({
  translations: z.array(productTranslationSchema).optional(),
});
