import { z } from 'zod';
export const taskStatusSchema = z.enum(["COMPLETED", "RUNNING", "PENDING", "FAILED"]);
export const taskTargetSchema = z.enum(["OFFER", "ORDER", "RENEWAL", "INVOICE"]);
export const taskTypeSchema = z.enum(["UPLOAD", "RESERVATION", "GENERATION"]);
export const createTaskSchema = z.object({
    target: taskTargetSchema,
    type: taskTypeSchema,
    status: taskStatusSchema,
});
export const updateTaskSchema = createTaskSchema.partial();
export const taskSchema = z.object({
    id: z.string(),
    jobId: z.string().optional(),
    status: taskStatusSchema,
    target: taskTargetSchema,
    type: taskTypeSchema,
    error: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
//# sourceMappingURL=task.schema.js.map