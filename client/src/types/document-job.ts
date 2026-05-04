import type { components } from "./api";

export type DocumentJob = components["schemas"]["DocumentJob"];

export type CreateDocumentJobInput = Omit<
    DocumentJob,
    "id" | "createdAt" | "updatedAt" | "order" | "offer"
>;
export type UpdateDocumentJobInput = Partial<CreateDocumentJobInput>;
