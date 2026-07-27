import { z } from 'zod';
import { isoDateTime } from './common.js';
import { offerListSchema } from './offer.schema.js';
export const createSupplierSchema = z.object({
    name: z.string().nonempty("Required!"),
    supplierId: z.string().optional(),
});
export const updateSupplierSchema = createSupplierSchema.partial({});
export const supplierSchema = createSupplierSchema.extend({
    id: z.string(),
    offers: offerListSchema,
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
//# sourceMappingURL=supplier.schema.js.map