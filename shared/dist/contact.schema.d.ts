import { z } from 'zod';
export declare const createContactSchema: z.ZodObject<{
    customerId: z.ZodString;
    salutation: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export declare const updateContactSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    salutation: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export declare const contactSchema: z.ZodObject<{
    customerId: z.ZodString;
    salutation: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    id: z.ZodString;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Contact = z.infer<typeof contactSchema>;
export declare const contactListSchema: z.ZodArray<z.ZodObject<{
    customerId: z.ZodString;
    salutation: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    id: z.ZodString;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>>;
export type ContactList = z.infer<typeof contactListSchema>;
//# sourceMappingURL=contact.schema.d.ts.map