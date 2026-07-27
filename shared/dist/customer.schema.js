import { z } from 'zod';
import { isoDateTime } from './common.js';
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
export const updateCustomerSchema = createCustomerSchema.partial();
export const customerSchema = createCustomerSchema.extend({
    id: z.string(),
    contactPersons: contactListSchema,
    orders: orderListSchema,
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const customerListSchema = z.array(customerSchema);
export const customerFiltersSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
//# sourceMappingURL=customer.schema.js.map