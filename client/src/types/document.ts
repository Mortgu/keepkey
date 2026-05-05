import type { components } from "./api";
import type { Task } from "./task";

export type Document = components["schemas"]["Document"];
export type DocumentStatus = components["schemas"]["DocumentStatus"];

export type CreateDocumentInput = Omit<
  Document,
  "id" | "createdAt" | "offer" | "order"
>;
export type UpdateDocumentInput = Partial<CreateDocumentInput>;

export type CreateTaskInput = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "offer" | "order"
>;
export type UpdateTaskInput = Partial<CreateTaskInput>;
