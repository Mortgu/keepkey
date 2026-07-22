import { z } from "zod";

const offerPositionSchema = z.object({
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

const offerFlatratesSchema = z.object({
    flatRateId: z.string(),
    quantity: z.number().int()
});

export const offerFormSchema = z.object({
    customerId: z.string().min(1, "Required!"),
    contactPersonId: z.string().min(1, "Required!"),
    userId: z.string().min(1, "Required!"),
    quoteId: z.string().min(1, "Required!"),
    language: z.enum(["EN", "DE"]),

    supplierId: z.string().nullable(),
    paymentTerm: z.string(),

    validUntil: z.string().datetime().nullable(),
    requestFrom: z.string().datetime().nullable(),

    offerPositions: z.array(offerPositionSchema).min(1),
    flatrates: z.array(offerFlatratesSchema).min(1)
});

export type offerFormValues = z.infer<typeof offerFormSchema>;