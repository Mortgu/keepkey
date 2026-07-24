import { z } from 'zod';
import { productSchema } from './product.schema.js';
import { contractSchema } from './contract.schema.js';



/* Row */
export const tariffRowSchema = z.object({});
export type TariffRow = z.infer<typeof tariffRowSchema>;

/* Column */
export const tariffColumnSchema = z.object({});
export type TariffColumn = z.infer<typeof tariffColumnSchema>;

/* TariffCellDefault */
export const tariffCellDefaultSchema = z.object({

});

/* TariffCellCustomer */
export const tariffCellCustomerSchema = z.object({});

/* TariffCell */
export const tariffCellSchema = z.object({
    id: z.string(),

    row: tariffRowSchema,
    rowId: z.string(),

    column: tariffColumnSchema,
    columnId: z.string(),

    default_cells: z.array(tariffCellDefaultSchema),
    customer_cells: z.array(tariffCellCustomerSchema),
});
export type TariffCell = z.infer<typeof tariffCellSchema>;

export const tariffCellListSchema = z.array(tariffCellSchema);
export type TariffCellList = z.infer<typeof tariffCellListSchema>;

/** TariffGroupProduct */
export const tariffGroupProductSchema = z.object({
    tariffGroupId: z.string(),

    product: productSchema,
    productId: z.string(),
});
export type TariffGroupProduct = z.infer<typeof tariffGroupProductSchema>;

/** TariffGroup */
export const createTariffGroupSchema = z.object({
    products: z.array(z.string()),
});
export type CreateTariffGroupInput = z.infer<typeof createTariffGroupSchema>;

export const updateTariffGroupSchema = createTariffGroupSchema.partial();
export type UpdateTariffGroupInput = z.infer<typeof updateTariffGroupSchema>;

/** Tariff */
export const createTariffSchema = z.object({
    contractId: z.string(),
});
export type CreateTariffInput = z.infer<typeof createTariffSchema>;

export const tariffSchema = createTariffSchema.extend({
    id: z.string(),

    contract: contractSchema,
    contractId: z.string(),

    tariffGroupId: z.string(),

    rows: z.array(tariffRowSchema),
    columns: z.array(tariffColumnSchema),

    cells: z.array(tariffGroupProductSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Tariff = z.infer<typeof tariffSchema>;

export const tariffGroupSchema = z.object({
    id: z.string(),

    products: z.array(tariffGroupProductSchema),
    tariffs: z.array(tariffSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffGroup = z.infer<typeof tariffGroupSchema>;

export const tariffHistorySchema = z.object({
    id: z.string(),
    productId: z.string(),
    contractId: z.string(),

    version: z.number().int(),
    snapshot: z.record(z.string(), z.never()),

    createdAt: z.string(),
});
export type TariffHistory = z.infer<typeof tariffHistorySchema>;