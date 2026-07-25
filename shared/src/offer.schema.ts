import { z } from "zod";
import { userSchema } from "./user.schema.js";
import { contactSchema } from "./contact.schema.js";
import { customerSchema } from "./customer.schema.js";
import { contractSchema } from "./contract.schema.js";
import { productSchema } from "./product.schema.js";
import { flatrateSchema } from "./flatrate.schema.js";
import { documentArtifactSchema, documentStatusSchema } from "./document.schema.js";

/* OfferPosition */
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

export const updateOfferPositionSchema = createOfferPositionSchema.partial();
export type UpdateOfferPositionInput = z.infer<typeof updateOfferPositionSchema>;

export const offerPositionSchema = createOfferPositionSchema.extend({
    id: z.string(),
    offerId: z.string(),

    contract: contractSchema,
    product: productSchema,

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type OfferPosition = z.infer<typeof offerPositionSchema>;

/* OfferFlatrate */
export const createOfferFlatrateSchema = z.object({
    flatRateId: z.string(),
    quantity: z.number().int(),
});
export type CreateOfferFlatrateInput = z.infer<typeof createOfferFlatrateSchema>;

export const updateOfferFlatrateSchema = createOfferFlatrateSchema.partial();
export type UpdateOfferFlatrateInput = z.infer<typeof updateOfferFlatrateSchema>;

export const offerFlatrateSchema = createOfferFlatrateSchema.extend({
    id: z.string(),
    offerId: z.string(),

    total_cents: z.number().int().positive(),
    flatRate: flatrateSchema,
});
export type OfferFlatrate = z.infer<typeof offerFlatrateSchema>;

/* OfferDiscount */
export const createOfferDiscountSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    amount_cents: z.number().int().nonnegative(),
});
export type CreateOfferDiscountInput = z.infer<typeof createOfferDiscountSchema>;

export const updateOfferDiscountSchema = createOfferDiscountSchema.partial();
export type updateOfferDiscountInput = z.infer<typeof updateOfferDiscountSchema>;

/* OfferDocument */
export const createOfferDocumentSchema = z.object({});
export type CreateOfferDocumentInput = z.infer<typeof createOfferDocumentSchema>;

export const updateOfferDocumentSchema = createOfferDocumentSchema.partial();
export type UpdateOfferDocumentInput = z.infer<typeof updateOfferDocumentSchema>;

export const offerDocumentSchema = createOfferDocumentSchema.extend({
    id: z.string(),
    displayName: z.string().optional(),

    version: z.number(),

    sourceVersion: z.number().optional(),
    status: documentStatusSchema,
    isCurrent: z.boolean(),
    error: z.string().optional(),

    offerId: z.string(),
    artifacts: z.array(documentArtifactSchema),
    taskId: z.string(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type OfferDocument = z.infer<typeof offerDocumentSchema>;

/* OfferRevision */
export const offerRevisionSchema = z.object({
    id: z.string(),
    version: z.number().int().positive(),

    createdAt: z.string(),
    changedBy: z.object({
        id: z.string(),
        name: z.string(),
    }),
});
export type OfferRevision = z.infer<typeof offerRevisionSchema>;

/* Offer*/
export const createOfferSchema = z.object({
    customerId: z.string(),
    contactPersonId: z.string(),
    userId: z.string(),
    supplierId: z.string().nullable(),
    quoteId: z.string().trim().nonempty("Required!"),
    paymentTerm: z.string().nonempty("Required!"),
    validUntil: z.string().nullable(),
    requestFrom: z.string().nullable(),
    language: z.enum(["EN", "DE"]),

    featureComparison: z.boolean(),
    toCompare: z.array(z.string()),

    offerPositions: z.array(createOfferPositionSchema).min(1),
    flatrates: z.array(createOfferFlatrateSchema),

    discounts: z.array(createOfferDiscountSchema),
});
export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = createOfferSchema.extend({
    expectedVersion: z.number().int().positive(),
});
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

export const offerSchema = z.object({
    id: z.string(),

    customerId: z.string(),
    contactPersonId: z.string(),
    userId: z.string(),
    supplierId: z.string().nullable().optional(),

    quoteId: z.string(),
    paymentTerm: z.string(),
    validUntil: z.string().nullable().optional(),
    requestFrom: z.string().nullable().optional(),
    language: z.enum(["EN", "DE"]),

    featureComparison: z.boolean(),
    toCompare: z.array(z.string()),

    offerPositions: z.array(offerPositionSchema),
    offerFlatRates: z.array(offerFlatrateSchema),
    offerDiscounts: z.array(z.lazy(() => offerDiscountSchema)),
    offerDocuments: z.array(offerDocumentSchema),

    user: userSchema,
    customer: customerSchema,
    customerContactPerson: contactSchema,

    net_amount: z.number().int(),
    version: z.number().int().positive(),

    date: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Offer = z.infer<typeof offerSchema>;

export const offerListSchema = z.array(offerSchema);
export type OfferList = z.infer<typeof offerListSchema>;

export const offerDiscountSchema = z.object({
    id: z.string(),
    offerId: z.string(),

    title: z.string(),
    description: z.string().optional(),

    amount_cents: z.number().int(),

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type OfferDiscount = z.infer<typeof offerDiscountSchema>;

export const restoreOfferRevisionSchema = z.object({
    expectedVersion: z.number().int().positive(),
});

export const offerFilterSchema = z.object({
    search: z.string().optional(),
    companyIds: z.array(z.string()).optional(),
    contactPersonIds: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    sort: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.number().int().positive().optional().default(50),
});
export type OfferFilterParams = z.input<typeof offerFilterSchema>;

export const offersPageSchema = z.object({
    items: z.array(offerSchema),
    nextCursor: z.string().nullable(),
});
export type OffersPage = z.infer<typeof offersPageSchema>;