import { z } from 'zod';

export const taskStatusSchema = z.enum(["COMPLETED", "RUNNING", "PENDING", "FAILED"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskTargetSchema = z.enum(["OFFER", "ORDER", "RENEWAL", "INVOICE"]);
export type TaskTarget = z.infer<typeof taskTargetSchema>;

export const taskTypeSchema = z.enum(["UPLOAD", "RESERVATION", "GENERATION"]);
export type TaskType = z.infer<typeof taskTypeSchema>;

export const createTaskSchema = z.object({
    target: taskTargetSchema,
    type: taskTypeSchema,
    status: taskStatusSchema,
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

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
export type Task = z.infer<typeof taskSchema>;
