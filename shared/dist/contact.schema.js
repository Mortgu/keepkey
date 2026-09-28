import { z } from 'zod';
import { isoDateTime } from './common.js';
export const createContactSchema = z.object({
    customerId: z.string(),
    salutation: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
});
/** Ansprechpartner, der zusammen mit einem neuen Kunden angelegt wird — die Kunden-ID gibt es dann noch nicht. */
export const newCustomerContactSchema = createContactSchema.omit({ customerId: true });
export const updateContactSchema = createContactSchema.partial();
export const contactSchema = createContactSchema.extend({
    id: z.string(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const contactListSchema = z.array(contactSchema);
//# sourceMappingURL=contact.schema.js.map