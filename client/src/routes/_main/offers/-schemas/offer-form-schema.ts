import { z } from "zod";

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

    featureComparison: z.boolean(),
});

export type offerFormValues = z.infer<typeof offerFormSchema>;