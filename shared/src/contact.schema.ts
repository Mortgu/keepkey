import { z } from 'zod';

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

    createdAt: z.date(),
    updatedAt: z.date(),
});
export type Contact = z.infer<typeof contactSchema>;

export const contactListSchema = z.array(contactSchema);
export type ContactList = z.infer<typeof contactListSchema>;