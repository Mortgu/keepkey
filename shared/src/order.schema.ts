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

/* OrderRevision */
export const orderRevisionSchema = z.object({
    id: z.string(),
    version: z.number().int(),

    createdAt: z.string(),
    changedBy: z.object({
        id: z.string(),
        name: z.string(),
    }),
});
export type OrderRevision = z.infer<typeof orderRevisionSchema>;

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
    })
    .strict();
export const updateOrderSchema = z
    .object({
        expectedVersion: z.number().int().positive(),
        order: orderMetadataSchema,
    })
    .strict();
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<
    typeof updateOrderSchema
>;

/* Restore Order Revision */
export const restoreOrderRevisionSchema = z.object({
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

    net_amount: z.number().int(),
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
    companyIds: z.array(z.string()).optional(),
});
export type OrderFilterParams = z.input<typeof orderFilterSchema>;
