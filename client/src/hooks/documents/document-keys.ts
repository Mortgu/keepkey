import type { DocumentType } from "@keepit/schemas";

export const documentKeys = {
    all: ["documents"] as const,
    capabilities: () => [...documentKeys.all, "capabilities"] as const,
    task: (taskId: string) => [...documentKeys.all, "task", taskId] as const,
    /** Cache für den imperativen DOCX-Download zum Editieren (`refetch`-Muster). */
    fetchedDocx: (type: DocumentType, documentId: string) =>
        [...documentKeys.all, "fetched-docx", type, documentId] as const,
};
