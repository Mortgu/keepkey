import type { components } from "./api";

export type Document = components["schemas"]["Document"];
export type Task = components["schemas"]["Task"];
export type DocumentStatus = components["schemas"]["DocumentStatus"];
export type TaskStatus = components["schemas"]["TaskStatus"];
export type TaskType = components["schemas"]["TaskType"];

export type CreateDocumentInput = Omit<Document, "id" | "createdAt" | "offer" | "order">;
export type UpdateDocumentInput = Partial<CreateDocumentInput>;

export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt" | "offer" | "order">;
export type UpdateTaskInput = Partial<CreateTaskInput>;
