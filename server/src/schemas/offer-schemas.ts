import { z } from "zod";

const offerPositionSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration_months: z.number().int().positive(),
    quantity: z.number().int().positive(),
    optional: z.boolean().optional(),
});

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
});
