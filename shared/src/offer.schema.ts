import z from "zod";

export const createOfferPositionSchema = z.object({
    productId: z.string(),
    contractId: z.string(),
    free_months: z.number().int(),
    optional: z.boolean(),
    quantity: z.number().int(),
    total_cents: z.number().int(),
    duration_months: z.number().int(),

    // TODO: remove these from the body
    discount_cents: z.number().int(),
    eur_user_month: z.number().int(),
});

export type CreateOfferPositionInput = z.infer<typeof createOfferPositionSchema>;

export const createOfferFlatrateSchema = z.object({
    flatRateId: z.string(),
    quantity: z.number().int(),
});

export type CreateOfferFlatrateInput = z.infer<typeof createOfferFlatrateSchema>;

export const createOfferSchema = z.object({
    customerId: z.string().nonempty("Required!"),
    contactPersonId: z.string().nonempty("Required!"),
    userId: z.string().nonempty("Required!"),
    quoteId: z.string().trim().nonempty("Required!"),
    language: z.enum(["EN", "DE"]),

    supplierId: z.string().nonempty("Required!"),
    paymentTerm: z.string().nonempty("Required!"),

    validUntil: z.string().nullable(),
    requestFrom: z.string().nullable(),

    featureComparison: z.boolean(),
    toCompare: z.array(z.string()),

    offerPositions: z.array(createOfferPositionSchema).min(1),
    flatrates: z.array(createOfferFlatrateSchema),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = createOfferSchema.extend({
    offerId: z.string(),
    expectedVersion: z.number().int().positive(),
});

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;