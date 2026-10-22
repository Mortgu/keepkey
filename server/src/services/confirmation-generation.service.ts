import type { DocumentFormat, DocumentStatus } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
import { buildConfirmation } from "../pipelines/confirmation/build-confirmation.js";
import { runGeneration, type GenerationAdapter } from "./document-generation.js";

type ConfirmationDocumentForGeneration = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    confirmationId: string;
    artifacts: { format: DocumentFormat }[];
};

/**
 * AB-Konditionen sind ab Anlage unveränderlich — `currentParentVersion`
 * liefert `null`, es gibt nichts, wogegen diese Generierung veralten könnte.
 */
const confirmationAdapter: GenerationAdapter<ConfirmationDocumentForGeneration> = {
    typeName: "ConfirmationDocument",
    type: "confirmation",
    findByTask: (taskId) => prisma.confirmationDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { artifacts: true },
    }),
    currentParentVersion: () => null,
    build: (doc) => buildConfirmation(doc.confirmationId),
    templateKind: "CONFIRMATION",
    ownerKey: (doc) => ({ confirmationDocumentId: doc.id }),
    recheckNotStale: async () => {},
    demoteSiblingsWhere: (doc) => ({ confirmationId: doc.confirmationId, isCurrent: true }),
};

export async function generateConfirmationDocument(taskId: string): Promise<void> {
    return runGeneration(taskId, confirmationAdapter);
}
