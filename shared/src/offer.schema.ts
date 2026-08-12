import { z } from "zod";
import { isoDateTime } from './common.js';
import { userSchema } from "./user.schema.js";
import { contactSchema } from "./contact.schema.js";
import { customerSchema } from "./customer.schema.js";
import { contractSchema } from "./contract.schema.js";
import { productSchema } from "./product.schema.js";
import { flatrateSchema } from "./flatrate.schema.js";
import { documentArtifactSchema, documentStatusSchema } from "./document.schema.js";

/* Belegnummer */

/**
 * 2 Ziffern Geschaeftsjahr + 3 Ziffern Zaehler (26000, 26001, ...). Die Nummer ist zugleich
 * der Dateipraefix in NextCloud, deshalb wird das Format schon an der API-Grenze erzwungen.
 */
export const quoteIdSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Belegnummer muss 6-stellig sein");

export const quoteIdSuggestionSchema = z.object({
    quoteId: z.string(),
    cloudChecked: z.boolean(),
});
export type QuoteIdSuggestion = z.infer<typeof quoteIdSuggestionSchema>;

export const quoteIdConflictSchema = z.enum(["db", "cloud", "format"]);
export type QuoteIdConflict = z.infer<typeof quoteIdConflictSchema>;

export const quoteIdAvailabilitySchema = z.object({
    quoteId: z.string(),
    available: z.boolean(),
    conflict: quoteIdConflictSchema.nullable(),
    cloudChecked: z.boolean(),
});
export type QuoteIdAvailability = z.infer<typeof quoteIdAvailabilitySchema>;

/* OfferPosition */
export const createOfferPositionSchema = z.object({
    productId: z.string(),
    contractId: z.string(),
    free_months: z.number().int(),
    optional: z.boolean(),
    quantity: z.number().int(),
    total_cents: z.number().int(),
    duration: z.number().int(),

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

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
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
    description: z.string().nullable(),
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

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
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
    quoteId: quoteIdSchema,
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

/* Lizenzerweiterung */

export const offerDerivationTypeSchema = z.enum(["RENEWAL", "LICENSE_EXTENSION"]);
export type OfferDerivationType = z.infer<typeof offerDerivationTypeSchema>;

/**
 * Eine Lizenzerweiterung bestellt zusätzliche Seats innerhalb eines laufenden
 * Vertrags. Sie verweist auf die Positionen des Quellangebots statt sie zu
 * beschreiben: Produkt, Vertrag und Laufzeit bleiben unverändert, nur die Menge
 * darf abweichen. Preise stehen bewusst nicht im Body — sie werden serverseitig
 * aus der angepinnten Tarif-Version aufgelöst.
 */
export const extendOfferPositionSchema = z.object({
    sourcePositionId: z.string(),
    quantity: z.number().int().positive(),
});
export type ExtendOfferPositionInput = z.infer<typeof extendOfferPositionSchema>;

export const extendOfferSchema = z.object({
    quoteId: quoteIdSchema,
    validUntil: z.string().nullable(),
    requestFrom: z.string().nullable(),

    positions: z.array(extendOfferPositionSchema).min(1),
    discounts: z.array(createOfferDiscountSchema),
});
export type ExtendOfferInput = z.infer<typeof extendOfferSchema>;

export const offerDiscountSchema = z.object({
    id: z.string(),
    offerId: z.string(),

    title: z.string(),
    description: z.string().nullable(),

    amount_cents: z.number().int(),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type OfferDiscount = z.infer<typeof offerDiscountSchema>;

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
    offerDiscounts: z.array(offerDiscountSchema),
    offerDocuments: z.array(offerDocumentSchema),

    renewedFromOfferId: z.string().nullable().optional(),
    derivationType: offerDerivationTypeSchema.nullable().optional(),

    user: userSchema,
    customer: customerSchema,
    customerContactPerson: contactSchema,

    net_amount: z.number().int(),
    version: z.number().int().positive(),

    date: isoDateTime,
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type Offer = z.infer<typeof offerSchema>;

export const offerListSchema = z.array(offerSchema);
export type OfferList = z.infer<typeof offerListSchema>;

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