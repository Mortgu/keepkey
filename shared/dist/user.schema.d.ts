import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const createUserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    salutation: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    salutation: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    salutation: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type User = z.infer<typeof userSchema>;
export declare const userListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    salutation: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>>;
export type UserList = z.infer<typeof userListSchema>;
export declare const userFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserFilterParams = z.infer<typeof userFilterSchema>;
//# sourceMappingURL=user.schema.d.ts.map