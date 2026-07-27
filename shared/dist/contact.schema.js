import { z } from 'zod';
import { isoDateTime } from './common.js';
export const createContactSchema = z.object({
    customerId: z.string(),
    salutation: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
});
export const updateContactSchema = createContactSchema.partial();
export const contactSchema = createContactSchema.extend({
    id: z.string(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export const contactListSchema = z.array(contactSchema);
//# sourceMappingURL=contact.schema.js.map