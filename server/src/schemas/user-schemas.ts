import { z } from "zod";
import { contactPersonSchema } from "./customer-schemas.js";

export const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    name: z.string().optional(),
    role: z.string().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().optional(),
    salutation: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    banned: z.boolean().optional(),
    banReason: z.string().optional(),
    banExpires: z.string().datetime().optional(),
    image: z.string().optional(),
});

export const upsertAddressSchema = z.object({
    street: z.string().optional(),
    plz: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
});

export const createContactPersonsSchema = z.array(contactPersonSchema).min(1);
