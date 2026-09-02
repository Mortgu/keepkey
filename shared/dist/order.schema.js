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
/* OrderFlatRate */
export const orderFlatRateSchema = z.object({
    id: z.string(),
    orderId: z.string(),
    flatRateId: z.string(),
    flatRate: flatrateSchema,
    quantity: z.number().int(),
    total_cents: z.number().int(),
});
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
/* Order (create) */
export const createOrderSchema = z.object({
    id: z.string().min(1),
    orderId: z.string().min(1, "Bestell-Nr. erforderlich"),
    date: z.string().optional(),
    projectNumber: z.string().optional(),
    projectDescription: z.string().optional(),
    orderDetails: z.string().optional(),
});
/* Order (update) */
const orderFieldsSchema = z.object({
    supplierId: z.string().nullable(),
    customerId: z.string().min(1),
    contactPersonId: z.string().min(1),
    employeeId: z.string().min(1),
    contractId: z.string().min(1),
    duration_months: z.number().int().positive(),
    orderId: z.string().min(1),
    paymentTerm: z.string(),
    projectNumber: z.string().nullable(),
    projectDescription: z.string().nullable(),
    orderDetails: z.string().nullable(),
    date: z.string(),
    validUntil: z.string().nullable(),
    requestFrom: z.string().nullable(),
});
const orderPositionInputSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    optional: z.boolean().nullable(),
    total_cents: z.number().int().min(0),
});
const orderFlatRateInputSchema = z.object({
    flatRateId: z.string().min(1),
    quantity: z.number().int().positive(),
    total_cents: z.number().int().min(0),
});
export const updateOrderSchema = z.object({
    expectedVersion: z.number().int().positive(),
    order: orderFieldsSchema,
    positions: z.array(orderPositionInputSchema),
    flatRates: z.array(orderFlatRateInputSchema),
});
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
    projectNumber: z.string().optional(),
    projectDescription: z.string().optional(),
    orderDetails: z.string().optional(),
    date: z.string(),
    validUntil: z.string().optional(),
    requestFrom: z.string().optional(),
    net_amount: z.number().int(),
    version: z.number().int(),
    customer: z.object({
        id: z.string(),
        companyName: z.string(),
    }),
    customerContactPerson: z.object({
        id: z.string(),
        salutation: z.string(),
        firstName: z.string(),
        lastName: z.string(),
    }),
    offer: offerSchema,
    documents: z.array(orderDocumentSchema),
    orderPositions: z.array(orderPositionSchema),
    flatRates: z.array(orderFlatRateSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const orderListSchema = z.array(orderSchema);
/* Order Filters */
export const orderFilterSchema = z.object({
    companyIds: z.array(z.string()).optional(),
});
//# sourceMappingURL=order.schema.js.map