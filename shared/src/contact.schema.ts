import { z } from 'zod';
import { isoDateTime } from './common.js';

export const createContactSchema = z.object({
    customerId: z.string(),
    salutation: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

/** Ansprechpartner, der zusammen mit einem neuen Kunden angelegt wird — die Kunden-ID gibt es dann noch nicht. */
export const newCustomerContactSchema = createContactSchema.omit({ customerId: true });
export type NewCustomerContactInput = z.infer<typeof newCustomerContactSchema>;

export const updateContactSchema = createContactSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const contactSchema = createContactSchema.extend({
    id: z.string(),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type Contact = z.infer<typeof contactSchema>;

export const contactListSchema = z.array(contactSchema);
export type ContactList = z.infer<typeof contactListSchema>;