import { z } from "zod";

const createOfferFlatrateSchema = z.object({
  flatRateId: z.string().min(1), // flatRateId
  quantity: z.number().int().default(1),
});

export const createOfferFlatratesSchema = z.array(createOfferFlatrateSchema);

export const updateOfferFlatrateSchema = createOfferFlatrateSchema.partial();

export const createOfferFieldsSchema = z.object({
  customerId: z.string().min(1),
  contactPersonId: z.string().min(1),
  userId: z.string().min(1),
  quoteId: z.string().min(1),
  language: z.enum(["DE", "EN"]).default("DE"),
  featureComparison: z.boolean().default(false),

  supplierId: z.string().nullable(),
  // DB-Feld ist non-nullable (Offer.paymentTerm String) — null führte bisher zu einem 500er in Prisma
  paymentTerm: z.string(),
  validUntil: z.string().nullable(),
  requestFrom: z.string().nullable(),
  date: z.string().nullable().optional(),
})

const createOfferPositionSchema = z.object({
  productId: z.string().min(1),
  contractId: z.string().min(1),
  duration_months: z.number().int().positive(),
  free_months: z.number().int().min(0).default(0),
  quantity: z.number().int().positive(),
  optional: z.boolean().optional(),
});

export const createOfferPositionsSchema = z.array(createOfferPositionSchema);

export const updateOfferPositionSchema = createOfferPositionSchema.partial();

export const createOfferSchema = z.object({
  offer: createOfferFieldsSchema,
  positions: createOfferPositionsSchema,
  flatrates: createOfferFlatratesSchema,
});

export const updateOfferSchema = createOfferSchema.extend({
  expectedVersion: z.number().int().positive(),
});

export const restoreOfferRevisionSchema = z.object({
  expectedVersion: z.number().int().positive(),
});
