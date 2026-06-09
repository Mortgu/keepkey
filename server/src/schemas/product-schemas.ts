import { z } from "zod";

const productTranslationSchema = z.object({
  language: z.enum(["DE", "EN"]),
  name: z.string().min(1),
  description: z.string().optional(),
  table: z.string().optional(),
});

export const createProductSchema = z.object({
  key: z.string().min(1),
  translations: z.array(productTranslationSchema).min(1),
});

export const updateProductSchema = z.object({
  key: z.string().min(1).optional(),
  translations: z.array(productTranslationSchema).optional(),
});
