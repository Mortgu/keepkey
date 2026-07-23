import z from "zod";

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
  productId: z.string(),
  contractId: z.string(),
  duration_months: z.number(),
  free_months: z.number(),
  quantity: z.number(),
  optional: z.boolean(),
  total_cents: z.number(),
  eur_user_month: z.number(),
  discount_cents: z.number(),
  price: z.number().optional(),
  breakdown: z.object({
    unitPrice: z.number(),
    totalPrice: z.number(),
    basePrice: z.number().optional(),
    discountPercent: z.number().optional(),
    discountAmount: z.number().optional(),
    freeMonthsDiscount: z.number().optional(),
  }).optional(),
});

export const createOfferPositionsSchema = z.array(createOfferPositionSchema);

export const updateOfferPositionSchema = createOfferPositionSchema.partial();

export const restoreOfferRevisionSchema = z.object({
  expectedVersion: z.number().int().positive(),
});
