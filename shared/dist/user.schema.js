import { z } from "zod";
import { isoDateTime } from './common.js';
export const createUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),
    email: z.string(),
    phone: z.string(),
    password: z.string(),
});
export const updateUserSchema = createUserSchema.partial();
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
export const userListSchema = z.array(userSchema);
//# sourceMappingURL=user.schema.js.map