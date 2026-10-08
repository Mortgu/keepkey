import { z } from 'zod';
import { productSchema } from './product.schema.js';
import { contractSchema } from './contract.schema.js';
import { flatrateSchema } from './flatrate.schema.js';
import { documentStatusSchema, documentArtifactSchema } from './document.schema.js';
import { offerSchema } from './offer.schema.js';

/* OrderPosition */
/** Vertrag und Laufzeit stehen an der Bestellung, nicht hier — siehe {@link orderSchema}. */
export const orderPositionSchema = z.object({
    id: z.string(),
    orderId: z.string(),

    productId: z.string(),
    product: productSchema,

    quantity: z.number().int(),
    optional: z.boolean().optional(),

    total_cents: z.number().int(),

    createdAt: z.string(),
});
export type OrderPosition = z.infer<typeof orderPositionSchema>;

/* Einkaufspreis je Position — die Bestellung geht an den Zulieferer. */
export const purchasePositionInputSchema = z
    .object({
        /** Id der Position im Accepted-Snapshot. */
        offerPositionId: z.string().min(1),
        /** Einkaufspreis je User/Monat in Cent, wie der Verkaufspreis. */
        purchase_eur_user_month: z.number().int().min(0),
    })
    .strict();
export type PurchasePositionInput = z.infer<typeof purchasePositionInputSchema>;

export const supplierPositionSchema = z.object({
    offerPositionId: z.string(),
    productId: z.string(),
    quantity: z.number().int(),
    free_months: z.number().int(),
    /** Verkaufspreis je User/Monat, zum Vergleich. */
    eur_user_month: z.number().int(),
    purchase_eur_user_month: z.number().int(),
    purchase_total_cents: z.number().int(),
    purchase_discount_cents: z.number().int(),
    /** true bei Altbestellungen ohne gespeicherte Einkaufspreise (Fallback = Verkaufspreis). */
    fallback: z.boolean(),
});
export type SupplierPosition = z.infer<typeof supplierPositionSchema>;

/* OrderFlatRate */
export const orderFlatRateSchema = z.object({
    id: z.string(),
    orderId: z.string(),

    flatRateId: z.string(),
    flatRate: flatrateSchema,

    quantity: z.number().int(),
    total_cents: z.number().int(),
});
export type OrderFlatRate = z.infer<typeof orderFlatRateSchema>;

/* OrderDocument */
export const orderDocumentSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),

    version: z.number(),
    sourceVersion: z.number().optional(),

    status: documentStatusSchema,
    isCurrent: z.boolean(),
    error: z.string().optional(),

    orderId: z.string(),
    taskId: z.string(),
    artifacts: z.array(documentArtifactSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().optional(),
});
export type OrderDocument = z.infer<typeof orderDocumentSchema>;

/* Shared write contract: orders contain metadata only. */
const dateInput = z
    .string()
    .refine(
        (value) =>
            value.trim() !== "" && Number.isFinite(new Date(value).getTime()),
        "Invalid date",
    );
export const orderMetadataSchema = z
    .object({
        orderId: z.string().trim().min(1),
        date: dateInput,
        projectNumber: z.string().nullable(),
        projectDescription: z.string().nullable(),
        orderDetails: z.string().nullable(),
        contractStartDate: dateInput.nullable().optional(),
    })
    .strict();
export const createOrderSchema = z
    .object({
        id: z.string().min(1),
        expectedOfferVersion: z.number().int().positive(),
        orderId: z.string().trim().min(1),
        date: dateInput.optional(),
        projectNumber: z.string().optional(),
        projectDescription: z.string().optional(),
        orderDetails: z.string().optional(),
        contractStartDate: dateInput.optional(),
        /** Genau eine Zeile je Snapshot-Position; der Server prüft die Abdeckung. */
        positions: z.array(purchasePositionInputSchema).min(1),
    })
    .strict();
export const updateOrderSchema = z
    .object({
        expectedVersion: z.number().int().positive(),
        order: orderMetadataSchema,
        /** Optional: Einkaufspreise ersetzen. */
        positions: z.array(purchasePositionInputSchema).min(1).optional(),
    })
    .strict();
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<
    typeof updateOrderSchema
>;

/* Cancel Order */
export const cancelOrderSchema = z.object({
    expectedVersion: z.number().int().positive(),
});

/* Order (entity) */
export const orderSchema = z.object({
    id: z.string(),

    supplierId: z.string().nullable().optional(),
    customerId: z.string(),
    contactPersonId: z.string(),
    employeeId: z.string(),

    offerId: z.string(),
    orderId: z.string(),

    contractId: z.string(),
    contract: contractSchema,
    duration_months: z.number().int(),

    paymentTerm: z.string(),
    projectNumber: z.string().nullish(),
    projectDescription: z.string().nullish(),
    orderDetails: z.string().nullish(),

    date: z.string(),
    validUntil: z.string().nullish(),
    requestFrom: z.string().nullish(),
    contractStartDate: z.string().nullish(),

    net_amount: z.number().int(),
    /** Einkaufsseite: Summe der Positionen zum Einkaufspreis (Pauschalen/Rabatte nicht enthalten). */
    purchase_net_amount: z.number().int(),
    supplierPositions: z.array(supplierPositionSchema),
    version: z.number().int(),

    customer: z.object({
        id: z.string(),
        companyName: z.string(),
    }),

    customerContactPerson: z.object({
        id: z.string(),
        salutation: z.string().nullable(),
        firstName: z.string(),
        lastName: z.string(),
    }),

    offer: offerSchema.pick({ id: true, quoteId: true, version: true, acceptedAt: true }),
    acceptedAt: z.string(),
    acceptedById: z.string(),
    cancelledAt: z.string().nullable(),
    discounts: z.array(z.object({ id: z.string(), title: z.string(), description: z.string().nullable(), amount_cents: z.number().int() })),

    documents: z.array(orderDocumentSchema),
    orderPositions: z.array(orderPositionSchema),
    flatRates: z.array(orderFlatRateSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderListSchema = z.array(orderSchema);
export type OrderList = z.infer<typeof orderListSchema>;

/* Order Filters */
export const orderFilterSchema = z.object({
    companyIds: z.union([z.string(), z.array(z.string())]).optional(),
});
export type OrderFilterParams = z.input<typeof orderFilterSchema>;
