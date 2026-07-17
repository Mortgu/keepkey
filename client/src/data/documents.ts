import type { DocumentType, GeneratedDocument } from "@/types";
import { BASE_URL, api } from "@/lib/api-client";

export const renameDocument = (
  type: DocumentType,
  documentId: string,
  displayName: string,
) => api<GeneratedDocument>(`/api/documents/${type}/${documentId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ displayName }),
});

export const deleteDocument = (type: DocumentType, documentId: string) =>
  api<void>(`/api/documents/${type}/${documentId}`, { method: "DELETE" });

export const uploadDocument = (type: DocumentType, documentId: string) =>
  api<void>(`/api/documents/${type}/${documentId}/upload`, { method: "POST" });

export const documentDownloadUrl = (
  type: DocumentType,
  documentId: string,
  format: "pdf" | "docx",
) => `${BASE_URL}/api/documents/${type}/${documentId}/artifacts/${format}`;
