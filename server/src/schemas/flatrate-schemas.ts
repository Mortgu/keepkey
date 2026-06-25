import { z } from "zod";

const flatRateTranslationSchema = z.object({
  language: z.enum(["DE", "EN"]),
  name: z.string().min(1),
  table: z.string().min(1),
});

export const flatRateSchema = z.object({
  total_cents: z.number().int().nonnegative(),
  translations: z.array(flatRateTranslationSchema).min(1),
});

export const createFlatRateSchema = flatRateSchema;

export const updateFlatRateSchema = flatRateSchema;
