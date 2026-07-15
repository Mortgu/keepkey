import type { components } from "./api";
import type { Task } from "./task";

export type DocumentArtifact = components["schemas"]["DocumentArtifact"];
export type DocumentStatus = components["schemas"]["DocumentStatus"];
export type DocumentType = "offer" | "order";
export type GeneratedDocument = Pick<
  components["schemas"]["OfferDocument"],
  "id" | "displayName" | "status" | "artifacts"
>;

export const findDocumentArtifact = (
  artifacts: Array<DocumentArtifact>,
  format: DocumentArtifact["format"],
) => artifacts.find((artifact) => artifact.format === format);

export type CreateTaskInput = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "offer" | "order"
>;
export type UpdateTaskInput = Partial<CreateTaskInput>;
