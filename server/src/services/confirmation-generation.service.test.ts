import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentStatus } from "@prisma/client";

const fake = vi.hoisted(() => {
    const tx = { documentArtifact: { create: vi.fn(async (args: { data: Record<string, unknown> }) => args.data) } };
    return {
        tx,
        transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
        findFirst: vi.fn(async (): Promise<{
            id: string;
            status: DocumentStatus;
            sourceVersion: number | null;
            confirmationId: string;
            artifacts: { format: string }[];
        } | null> => ({
            id: "doc-1",
            status: DocumentStatus.PROCESSING,
            sourceVersion: null,
            confirmationId: "conf-1",
            artifacts: [],
        })),
        buildConfirmation: vi.fn(async () => ({ data: {}, language: "DE" as const, displayName: "AB-1" })),
        renderDocument: vi.fn(async () => ({
            docxBuffer: Buffer.from("docx"),
            pdfBuffer: Buffer.from("pdf"),
            model: {},
            modelHash: "hash",
        })),
        storeDocumentArtifacts: vi.fn(async () => ({
            pdf: { objectKey: "pdf-key", size: 1, sha256: "a" },
            docx: { objectKey: "docx-key", size: 1, sha256: "b" },
        })),
        removeDocumentArtifacts: vi.fn(async () => {}),
        updateMany: vi.fn(async () => ({ count: 1 })),
    };
});

vi.mock("../lib/prismaClient.js", () => ({
    prisma: { confirmationDocument: { findFirst: fake.findFirst }, $transaction: fake.transaction },
}));
vi.mock("../pipelines/confirmation/build-confirmation.js", () => ({ buildConfirmation: fake.buildConfirmation }));
vi.mock("../lib/render-document.js", () => ({ renderDocument: fake.renderDocument }));
vi.mock("../lib/document-artifact-store.js", () => ({
    storeDocumentArtifacts: fake.storeDocumentArtifacts,
    removeDocumentArtifacts: fake.removeDocumentArtifacts,
}));
vi.mock("./document-repo.js", () => ({
    documentTable: () => ({ scope: "confirmations", updateMany: fake.updateMany, findWithArtifacts: vi.fn(async () => null) }),
}));

const { generateConfirmationDocument } = await import("./confirmation-generation.service.js");

describe("generateConfirmationDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fake.updateMany.mockResolvedValue({ count: 1 });
    });

    it("builds from the confirmationId, never checks staleness, and finalizes as a new version", async () => {
        await generateConfirmationDocument("task-1");

        expect(fake.buildConfirmation).toHaveBeenCalledWith("conf-1");
        expect(fake.renderDocument).toHaveBeenCalledWith(
            "CONFIRMATION",
            "DE",
            {},
            { documentType: "confirmation", documentId: "doc-1" },
            { schema: undefined },
        );
        expect(fake.updateMany).toHaveBeenCalledWith(
            { confirmationId: "conf-1", isCurrent: true },
            { isCurrent: false },
        );
        expect(fake.tx.documentArtifact.create).toHaveBeenCalledTimes(2);
        expect(fake.updateMany).toHaveBeenCalledWith(
            { id: "doc-1", deletedAt: null, status: DocumentStatus.PROCESSING },
            expect.objectContaining({ status: DocumentStatus.GENERATED, displayName: "AB-1", isCurrent: true }),
        );
    });

    it("does nothing when the task's document cannot be found", async () => {
        fake.findFirst.mockResolvedValue(null);

        await expect(generateConfirmationDocument("task-1")).rejects.toThrow("for task task-1 was not found");
        expect(fake.buildConfirmation).not.toHaveBeenCalled();
    });
});
