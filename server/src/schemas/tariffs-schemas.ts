import { z } from "zod";

export const createTariffSchema = z.object({
    productIds: z.array(z.string()).min(1),
});

export const updateTariffSchema = z.object({
    productIds: z.array(z.string()).min(1),
});

const configBase = {
    contractId: z.string().min(1),
    duration: z.number().int().positive(),
    min_quantity: z.number().int().nonnegative(),
    max_quantity: z.number().int().nonnegative().nullable().optional(),
    price: z.number().int().nonnegative(),
};

export const createTariffConfigSchema = z.object(configBase);

export const updateTariffConfigSchema = z.object({
    contractId: configBase.contractId.optional(),
    duration: configBase.duration.optional(),
    min_quantity: configBase.min_quantity.optional(),
    max_quantity: configBase.max_quantity,
    price: configBase.price.optional(),
});

export const createTariffCustomerSchema = z.object({
    ...configBase,
    customerId: z.string().min(1),
    productId: z.string().min(1),
});

export const updateTariffCustomerSchema = z.object({
    contractId: configBase.contractId.optional(),
    duration: configBase.duration.optional(),
    min_quantity: configBase.min_quantity.optional(),
    max_quantity: configBase.max_quantity,
    price: configBase.price.optional(),
    customerId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
});
