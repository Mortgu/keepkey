import { z } from 'zod';
import { isoDateTime } from './common.js';
import { contactListSchema } from './contact.schema.js';
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
});
export const updateCustomerSchema = createCustomerSchema.partial();
/* Stricte UI-Validierung für das Kunden-Formular. Bewusst strenger als
 * createCustomerSchema (das dem nullable DB/Server-Modell folgt): email
 * required + formatgeprüft, Adressen required. customerId/language/currency
 * werden vom Basis-Schema geerbt (nullish/enum); die Normalisierung von
 * null/"" übernimmt das Server-Schema. */
export const customerFormSchema = createCustomerSchema.extend({
    customerId: z.union([z.string(), z.undefined()]),
    companyName: z.string().min(1, "min. 1 Zeichen!"),
    email: z.email(),
    invoiceEmail: z.union([z.email(), z.undefined()]),
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    phone: z.string(),
});
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
export const customerListSchema = z.array(customerSchema);
export const customerFiltersSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
//# sourceMappingURL=customer.schema.js.map