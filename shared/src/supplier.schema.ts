import { z } from 'zod';
import { isoDateTime } from './common.js';

export const createSupplierSchema = z.object({
    name: z.string().nonempty("Required!"),
    supplierId: z.string().optional()
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.partial({});
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const supplierSchema = createSupplierSchema.extend({
    id: z.string(),

    _count: z.object({
        offers: z.int().positive(),
        orders: z.int().positive(),
    }),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type Supplier = z.infer<typeof supplierSchema>;

export const supplierFilterSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
export type SupplierFilterParams = z.infer<typeof supplierFilterSchema>;