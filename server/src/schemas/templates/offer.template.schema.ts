import z from "zod";

const offerTemplateProductItemSchema = z.object({
    name: z.string().optional().transform(v => (v === undefined ? "" : v)),
    description: z.string().nullish().transform(v => (v === undefined ? "" : v)),
    content: z.string().nullish().transform(v => (v === undefined ? "" : v)),
    quantity: z.string(),
    eur_user_month: z.string(),
    duration: z.string(),
    total: z.string(),
    contract: z.string(),
    optional: z.boolean().nullish().transform(v => (v === undefined ? null : v)),
    discount: z.object({
        free_months: z.number().int(),
        valid_until: z.string().nullish().transform(v => (v === undefined ? null : v)),
        total: z.string(),
    }).nullish().transform(v => (v === undefined ? null : v)),
});

export type OfferTemplateItem = z.infer<typeof offerTemplateProductItemSchema>;

const offerTemplateProductGroupSchema = z.object({
    names: z.string(),
    contract: z.string(),
    features: z.array(z.string()),
    _duration: z.number({}), // The raw number
    duration: z.string(),    // The formated string
});

export type OfferTemplateGroup = z.infer<typeof offerTemplateProductGroupSchema>;

export const offerTemplateSchema = z.object({
    quoteId: z.string().min(1),
    date: z.string().nullish().transform(v => (v === undefined ? null : v)),
    paymentTerm: z.string().nullish().transform(v => (v === undefined ? null : v)),
    validUntil: z.string().nullish().transform(v => (v === undefined ? null : v)),
    requestFrom: z.string().nullish().transform(v => (v === undefined ? null : v)),
    supplierId: z.string().nullish().transform(v => (v === undefined ? null : v)),
    compare: z.boolean().nullish().transform(v => ((v === undefined || v === null) ? false : v)),

    customer: z.object({
        id: z.string().nullish().transform(v => (v === undefined ? null : v)),
        companyName: z.string(),

        street: z.string().nullish().transform(v => (v === undefined ? null : v)),
        zip: z.string().nullish().transform(v => (v === undefined ? null : v)),
        city: z.string().nullish().transform(v => (v === undefined ? null : v)),

        fullName: z.string(),
        salutation: z.string().nullish().transform(v => (v === undefined ? null : v)),
        firstName: z.string(),
        lastName: z.string(),

        phone: z.string().nullish().transform(v => (v === undefined ? null : v)),
        email: z.string().nullish().transform(v => (v === undefined ? null : v)),
    }),

    employee: z.object({
        fullName: z.string(),
        salutation: z.string(),
        firstName: z.string(),
        lastName: z.string(),

        phone: z.string().nullish().transform(v => (v === undefined ? null : v)),
        email: z.string().nullish().transform(v => (v === undefined ? null : v)),
    }),

    product_names: z.string(),

    products: z.array(offerTemplateProductItemSchema),

    groups: z.array(offerTemplateProductGroupSchema),

    tables: z.array(z.object({
        products: z.string(),
        items: z.array(offerTemplateProductItemSchema),
        flatrates: z.array(z.object({
            name: z.string(),
            content: z.string().nullish().transform(v => (v === undefined ? null : v)),
            total: z.string()
        })),
        total: z.string(),
    })),
});

export type OfferTemplate = z.infer<typeof offerTemplateSchema>;