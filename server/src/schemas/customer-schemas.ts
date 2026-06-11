import {z} from "zod";

export const contactPersonSchema = z.object({
    salutation: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email().optional(),
});

export const createCustomerSchema = z.object({
    companyName: z.string().min(1),
    customerId: z.string().min(1),
    email: z.email().optional(),
    contactPersons: z.array(contactPersonSchema).optional(),
});

export const createContactSchema = z.object({
    customerId: z.string().optional(),

    salutation: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email().optional(),
})

export const updateCustomerSchema = z.object({
    companyName: z.string().min(1).optional(),
    customerId: z.string().optional(),
    email: z.email().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    plz: z.string().optional(),
    phone: z.string().optional(),
    contactPersons: z.array(contactPersonSchema).optional(),
});

export const updateContactSchema = z.object({
    salutation: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
});