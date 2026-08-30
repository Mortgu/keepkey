import { z } from "zod";
import { isoDateTime } from './common.js';

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

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

export const sessionUserSchema = z.object({
    id: z.string(),

    email: z.string(),
    emailVerified: z.boolean(),
    name: z.string(),
    image: z.string().nullish(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),
    email: z.string(),
    phone: z.string().nullable(),

    createdAt: isoDateTime,
    updatedAt: isoDateTime,
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
export type UserList = z.infer<typeof userListSchema>;

export const userFilterSchema = z.object({
    search: z.string().optional(),
    sort: z.string().optional(),
});
export type UserFilterParams = z.infer<typeof userFilterSchema>;