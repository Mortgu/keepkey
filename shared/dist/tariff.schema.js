import { z } from 'zod';
import { productSchema } from './product.schema.js';
import { contractSchema } from './contract.schema.js';
/* Row */
export const tariffRowSchema = z.object({
    id: z.string(),
    tariffId: z.string(),
    min_quantity: z.number().int(),
    max_quantity: z.number().int().nullable(),
    order: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/* Column */
export const tariffColumnSchema = z.object({
    id: z.string(),
    tariffId: z.string(),
    duration: z.number().int(),
    order: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/* TariffCellDefault */
export const tariffCellDefaultSchema = z.object({
    id: z.string(),
    cellId: z.string(),
    price: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/* TariffCellCustomer */
export const tariffCellCustomerSchema = z.object({
    id: z.string(),
    cellId: z.string(),
    customerId: z.string(),
    productId: z.string().nullable(),
    price: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/* TariffCell */
export const tariffCellSchema = z.object({
    id: z.string(),
    tariffId: z.string(),
    rowId: z.string(),
    columnId: z.string(),
    default_cells: z.array(tariffCellDefaultSchema),
    customer_cells: z.array(tariffCellCustomerSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const tariffCellListSchema = z.array(tariffCellSchema);
/** TariffGroupProduct */
export const tariffGroupProductSchema = z.object({
    id: z.string(),
    tariffGroupId: z.string(),
    product: productSchema,
    productId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/**
 * Base tariff shape shared by both the standalone tariff and the
 * tariffs nested inside a tariff group.  Neither side of the
 * Tariff ↔ TariffGroup cycle is included here to avoid circular types.
 */
const tariffBaseSchema = z.object({
    id: z.string(),
    contract: contractSchema,
    contractId: z.string(),
    tariffGroupId: z.string(),
    rows: z.array(tariffRowSchema),
    columns: z.array(tariffColumnSchema),
    cells: z.array(tariffCellSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/**
 * Slim tariff group — used as the `tariffGroup` field on a standalone
 * tariff.  Does NOT include `tariffs` (avoids the cycle).
 */
const tariffGroupSlimSchema = z.object({
    id: z.string(),
    products: z.array(tariffGroupProductSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/** TariffGroup (create) */
export const createTariffGroupSchema = z.object({
    products: z.array(z.string()),
});
export const updateTariffGroupSchema = createTariffGroupSchema.partial();
/** Tariff (create) */
export const createTariffSchema = z.object({
    contractId: z.string(),
});
/**
 * Standalone tariff — returned by `GET /api/tariffs/:groupId/:tariffId`.
 * Includes the slim tariff group (without nested tariffs).
 */
export const tariffSchema = tariffBaseSchema.extend({
    tariffGroup: tariffGroupSlimSchema,
});
/**
 * Tariff group — returned by `GET /api/tariffs` and `GET /api/tariffs/:id`.
 * Each nested tariff uses `tariffBaseSchema` (without `tariffGroup`).
 */
export const tariffGroupSchema = z.object({
    id: z.string(),
    products: z.array(tariffGroupProductSchema),
    tariffs: z.array(tariffBaseSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const tariffHistorySchema = z.object({
    id: z.string(),
    productId: z.string(),
    contractId: z.string(),
    version: z.number().int(),
    snapshot: z.unknown(),
    createdAt: z.string(),
});
//# sourceMappingURL=tariff.schema.js.map