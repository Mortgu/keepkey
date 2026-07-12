import {z} from "zod";

export const createTariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).min(1),
});

export const updateTariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).optional(),
});

export const createTariffSchema = z.object({
    contractId: z.string().min(1),
});

export const createTariffColumnSchema = z.object({
    duration: z.number().int(),
});

export const updateTariffColumnSchema = z.object({
    duration: z.number().int().optional(),
});

export const createTariffRowSchema = z.object({
    min_quantity: z.number().int(),
    max_quantity: z.number().int(),
});

export const updateTariffRowSchema = z.object({
    min_qty: z.number().int().optional(),
    max_qty: z.number().int().optional(),
});

export const updateTariffCellSchema = z.object({
    default_price: z.number().int().optional(),
    customer_price: z.number().int().optional(),
    customerId: z.string().min(1).optional(),
}).superRefine((data, ctx) => {
    if (data.customer_price !== undefined && !data.customerId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customerId'],
            message: 'customerId is required when customer_price is set',
        });
    }
    if (data.default_price === undefined && data.customer_price === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['default_price'],
            message: 'default_price or customer_price is required',
        });
    }
});

export const upsertCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.number().int().positive(),
    quantity: z.number().int().positive(),
    customerId: z.string().min(1),
    price: z.number().int().nonnegative(),
});

export const deleteCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.number().int().positive(),
    quantity: z.number().int().positive(),
    customerId: z.string().min(1),
});
