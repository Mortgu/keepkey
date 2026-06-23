import { z } from "zod";

const createOfferFlatrateSchema = z.object({
  flatRateId: z.string().min(1), // flatRateId
  quantity: z.number().int().default(1),
});

export const createOfferFlatratesSchema = z.array(createOfferFlatrateSchema);

export const updateOfferFlatrateSchema = createOfferFlatrateSchema.partial();

export const createOfferSchema = z.object({
  customerId: z.string().min(1),
  contactPersonId: z.string().min(1),
  userId: z.string().min(1),
  quoteId: z.string().min(1),
  language: z.enum(["DE", "EN"]).default("DE"),

  supplierId: z.string().nullable(),
  paymentTerm: z.string().nullable(),
  validUntil: z.string().nullable(),
  requestFrom: z.string().nullable(),
});

export const updateOfferSchema = createOfferSchema.partial();

const createOfferPositionSchema = z.object({
  productId: z.string().min(1),
  contractId: z.string().min(1),
  duration_months: z.number().int().positive(),
  quantity: z.number().int().positive(),
  optional: z.boolean().optional(),
});

export const createOfferPositionsSchema = z.array(createOfferPositionSchema);

export const updateOfferPositionSchema = createOfferPositionSchema.partial();

export const updateOfferDocumentSchema = z.object({
  displayName: z.string().optional(),
  isCurrent: z.boolean().optional(),
  version: z.number().int().optional(),
});