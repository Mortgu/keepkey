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
});
