import { z } from 'zod';
import { offerListSchema } from './offer.schema.js';

export const createSupplierSchema = z.object({
    name: z.string().nonempty("Required!"),
    supplierId: z.string().optional(),
});
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.partial({});
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const supplierSchema = createSupplierSchema.extend({
    id: z.string(),

    offers: offerListSchema,

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Supplier = z.infer<typeof supplierSchema>;