import { z } from "zod";
import { isoDateTime } from './common.js';
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
export const updateOfferPositionSchema = createOfferPositionSchema.partial();
export const offerPositionSchema = createOfferPositionSchema.extend({
    id: z.string(),
    offerId: z.string(),
    contract: contractSchema,
    product: productSchema,
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
/* OfferFlatrate */
export const createOfferFlatrateSchema = z.object({
    flatRateId: z.string(),
    quantity: z.number().int(),
});
export const updateOfferFlatrateSchema = createOfferFlatrateSchema.partial();
export const offerFlatrateSchema = createOfferFlatrateSchema.extend({
    id: z.string(),
    offerId: z.string(),
    total_cents: z.number().int().positive(),
    flatRate: flatrateSchema,
});
/* OfferDiscount */
export const createOfferDiscountSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    amount_cents: z.number().int().nonnegative(),
});
export const updateOfferDiscountSchema = createOfferDiscountSchema.partial();
/* OfferDocument */
export const createOfferDocumentSchema = z.object({});
export const updateOfferDocumentSchema = createOfferDocumentSchema.partial();
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
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
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
export const updateOfferSchema = createOfferSchema.extend({
    expectedVersion: z.number().int().positive(),
});
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
    date: isoDateTime,
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const offerListSchema = z.array(offerSchema);
export const offerDiscountSchema = z.object({
    id: z.string(),
    offerId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    amount_cents: z.number().int(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
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
export const offersPageSchema = z.object({
    items: z.array(offerSchema),
    nextCursor: z.string().nullable(),
});
//# sourceMappingURL=offer.schema.js.map