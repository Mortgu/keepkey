import { z } from 'zod';
export declare const taskStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    FAILED: "FAILED";
    COMPLETED: "COMPLETED";
    RUNNING: "RUNNING";
}>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export declare const taskTargetSchema: z.ZodEnum<{
    OFFER: "OFFER";
    ORDER: "ORDER";
    RENEWAL: "RENEWAL";
    INVOICE: "INVOICE";
}>;
export type TaskTarget = z.infer<typeof taskTargetSchema>;
export declare const taskTypeSchema: z.ZodEnum<{
    UPLOAD: "UPLOAD";
    RESERVATION: "RESERVATION";
    GENERATION: "GENERATION";
}>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export declare const createTaskSchema: z.ZodObject<{
    target: z.ZodEnum<{
        OFFER: "OFFER";
        ORDER: "ORDER";
        RENEWAL: "RENEWAL";
        INVOICE: "INVOICE";
    }>;
    type: z.ZodEnum<{
        UPLOAD: "UPLOAD";
        RESERVATION: "RESERVATION";
        GENERATION: "GENERATION";
    }>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        FAILED: "FAILED";
        COMPLETED: "COMPLETED";
        RUNNING: "RUNNING";
    }>;
}, z.core.$strip>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export declare const updateTaskSchema: z.ZodObject<{
    target: z.ZodOptional<z.ZodEnum<{
        OFFER: "OFFER";
        ORDER: "ORDER";
        RENEWAL: "RENEWAL";
        INVOICE: "INVOICE";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        UPLOAD: "UPLOAD";
        RESERVATION: "RESERVATION";
        GENERATION: "GENERATION";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        FAILED: "FAILED";
        COMPLETED: "COMPLETED";
        RUNNING: "RUNNING";
    }>>;
}, z.core.$strip>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export declare const taskSchema: z.ZodObject<{
    id: z.ZodString;
    jobId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        FAILED: "FAILED";
        COMPLETED: "COMPLETED";
        RUNNING: "RUNNING";
    }>;
    target: z.ZodEnum<{
        OFFER: "OFFER";
        ORDER: "ORDER";
        RENEWAL: "RENEWAL";
        INVOICE: "INVOICE";
    }>;
    type: z.ZodEnum<{
        UPLOAD: "UPLOAD";
        RESERVATION: "RESERVATION";
        GENERATION: "GENERATION";
    }>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Task = z.infer<typeof taskSchema>;
//# sourceMappingURL=task.schema.d.ts.map