import { z } from "zod";

export const createUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),
    email: z.string(),
    phone: z.string(),
    password: z.string(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),
    email: z.string(),
    phone: z.string(),

    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;