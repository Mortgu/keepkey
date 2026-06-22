import {z} from "zod";

export const createTariffSchema = z.object({
    productId: z.string().min(1),
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