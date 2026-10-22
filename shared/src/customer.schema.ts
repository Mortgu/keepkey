import { z } from 'zod';
import { isoDateTime } from './common.js';
import { contactListSchema, newCustomerContactSchema } from './contact.schema.js';
import { currencySchema } from './currency.schema.js';
import { languageSchema } from './language.schema.js';

export const createCustomerSchema = z.object({
    customerId: z.string().optional(),

    companyName: z.string(),
    email: z.string().optional(),
    invoiceEmail: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
    language: languageSchema,
    country: z.string(),
    currency: currencySchema,
    taxRate: z.number(),

    salutation: z.string().optional(),

    /** Optional: Ansprechpartner, die im selben Schritt mit angelegt werden. */
    contactPersons: z.array(newCustomerContactSchema).optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/* Ansprechpartner eines bestehenden Kunden laufen über die Contact-Endpunkte. */
export const updateCustomerSchema = createCustomerSchema.omit({ contactPersons: true }).partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const customerSchema = createCustomerSchema.extend({
    id: z.string(),

    contactPersons: contactListSchema,

    _count: z.object({
        offers: z.int().positive(),
        orders: z.int().positive(),
    }),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type Customer = z.infer<typeof customerSchema>;

export const customerListSchema = z.array(customerSchema);
export type CustomerList = z.infer<typeof customerListSchema>;

export const customerFiltersSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
export type CustomerFilterParams = z.infer<typeof customerFiltersSchema>;