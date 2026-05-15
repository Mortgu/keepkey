import { z } from "zod";

const offerPositionSchema = z.object({
  productId: z.string().min(1),
  contractId: z.string().min(1),
  duration_months: z.number().int().positive(),
  quantity: z.number().int().positive(),
  optional: z.boolean().optional(),
});

const offerFlatRateSchema = z.object({
  id: z.string().min(1), // flatRateId
  quantity: z.number().default(1),
  total_cents: z.number(),
});

export const createOfferSchema = z.object({
  offer: z.object({
    customerId: z.string().min(1),
    contactPersonId: z.string().min(1),
    userId: z.string().min(1),
    quoteId: z.string().min(1),

    supplierId: z.string().nullable(),
    paymentTerm: z.string().nullable(),
    validUntil: z.string().nullable(),
    requestFrom: z.string().nullable(),
  }),
  positions: z.array(offerPositionSchema).min(1, "Füge mindestens ein Produkt hinzu!"),
  flatRates: z.array(offerFlatRateSchema).optional(),
});

export const reserveQuoteIdSchema = z.object({
  quoteId: z.number().int(),
});