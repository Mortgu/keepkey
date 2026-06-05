import {z} from "zod";

export const reserveSchema = z.object({
    id: z.string().min(1),
});
