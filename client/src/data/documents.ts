import type { DocumentType } from "@keepit/schemas";
import { BASE_URL } from "@/lib/api-client";

export const documentDownloadUrl = (
  type: DocumentType,
  documentId: string,
  format: "pdf" | "docx",
) => `${BASE_URL}/api/documents/${type}/${documentId}/artifacts/${format}`;
