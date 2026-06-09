import { z } from "zod";

const contractTranslationSchema = z.object({
  language: z.enum(["DE", "EN"]),
  name: z.string().min(1),
  features: z.array(z.string()).optional().default([]),
  table: z.string().optional(),
});

export const createContractSchema = z.object({
  key: z.string().min(1),
  translations: z.array(contractTranslationSchema).min(1),
});

export const updateContractSchema = z.object({
  key: z.string().min(1).optional(),
  translations: z.array(contractTranslationSchema).optional(),
});
