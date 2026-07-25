import { z } from 'zod';
import { contactListSchema } from './contact.schema.js';
import { orderListSchema } from './order.schema.js';

export const createCustomerSchema = z.object({
    customerId: z.string().optional(),

    companyName: z.string(),
    email: z.string().optional(),
    invoiceEmail: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    language: z.string(),
    country: z.string(),
    currency: z.string(),
    taxRate: z.number(),

    salutation: z.string().optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const customerSchema = createCustomerSchema.extend({
    id: z.string(),

    contactPersons: contactListSchema,
    orders: orderListSchema,

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Customer = z.infer<typeof customerSchema>;

export const customerListSchema = z.array(customerSchema);
export type CustomerList = z.infer<typeof customerListSchema>;

export const customerFiltersSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
export type CustomerFilters = z.infer<typeof customerFiltersSchema>;