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