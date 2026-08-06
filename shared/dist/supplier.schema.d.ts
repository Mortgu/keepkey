import { z } from 'zod';
export declare const createSupplierSchema: z.ZodObject<{
    name: z.ZodString;
    supplierId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export declare const updateSupplierSchema: z.ZodObject<{
    name: z.ZodString;
    supplierId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export declare const supplierSchema: z.ZodObject<{
    name: z.ZodString;
    supplierId: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    _count: z.ZodObject<{
        offers: z.ZodInt;
        orders: z.ZodInt;
    }, z.core.$strip>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Supplier = z.infer<typeof supplierSchema>;
export declare const supplierFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SupplierFilterParams = z.infer<typeof supplierFilterSchema>;
//# sourceMappingURL=supplier.schema.d.ts.map