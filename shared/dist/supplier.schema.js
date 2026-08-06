import { z } from 'zod';
import { isoDateTime } from './common.js';
export const createSupplierSchema = z.object({
    name: z.string().nonempty("Required!"),
    supplierId: z.string().optional()
});
export const updateSupplierSchema = createSupplierSchema.partial({});
export const supplierSchema = createSupplierSchema.extend({
    id: z.string(),
    _count: z.object({
        offers: z.int().positive(),
        orders: z.int().positive(),
    }),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const supplierFilterSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
//# sourceMappingURL=supplier.schema.js.map