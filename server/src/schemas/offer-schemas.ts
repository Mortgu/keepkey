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
})

export const createOfferSchema = z.object({
    offer: z.object({
        supplierId: z.string().min(1),
        customerId: z.string().min(1),
        contactPersonId: z.string().min(1),
        userId: z.string().min(1),
        voucherId: z.string().optional(),
        paymentTerm: z.string().optional(),
        validUntil: z.string().nullable(),
        requestFrom: z.string().nullable(),
    }),
    positions: z.array(offerPositionSchema).min(1),
    flatRates: z.array(offerFlatRateSchema).optional(),
});
