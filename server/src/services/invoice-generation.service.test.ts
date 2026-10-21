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
            invoiceId: string;
            artifacts: { format: string }[];
        } | null> => ({
            id: "doc-1",
            status: DocumentStatus.PROCESSING,
            sourceVersion: null,
            invoiceId: "inv-1",
            artifacts: [],
        })),
        buildInvoice: vi.fn(async () => ({ data: {}, language: "DE" as const, displayName: "RE-1" })),
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
    prisma: { document: { findFirst: fake.findFirst }, $transaction: fake.transaction },
}));
vi.mock("../pipelines/invoice/build-invoice.js", () => ({ buildInvoice: fake.buildInvoice }));
vi.mock("../lib/render-document.js", () => ({ renderDocument: fake.renderDocument }));
vi.mock("../lib/document-artifact-store.js", () => ({
    storeDocumentArtifacts: fake.storeDocumentArtifacts,
    removeDocumentArtifacts: fake.removeDocumentArtifacts,
}));
vi.mock("./document-repo.js", () => ({
    documentTable: () => ({ scope: "invoices", updateMany: fake.updateMany, findWithArtifacts: vi.fn(async () => null) }),
}));

const { generateInvoiceDocument } = await import("./invoice-generation.service.js");

describe("generateInvoiceDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fake.updateMany.mockResolvedValue({ count: 1 });
    });

    it("builds from the invoiceId, never checks staleness, and finalizes as a new version", async () => {
        await generateInvoiceDocument("task-1");

        expect(fake.buildInvoice).toHaveBeenCalledWith("inv-1");
        expect(fake.renderDocument).toHaveBeenCalledWith(
            "INVOICE",
            "DE",
            {},
            { documentType: "invoice", documentId: "doc-1" },
            { schema: undefined },
        );
        expect(fake.updateMany).toHaveBeenCalledWith(
            { invoiceId: "inv-1", isCurrent: true },
            { isCurrent: false },
        );
        expect(fake.tx.documentArtifact.create).toHaveBeenCalledTimes(2);
        expect(fake.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: { taskId: "task-1", type: "INVOICE", deletedAt: null },
        }));
        expect(fake.tx.documentArtifact.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ documentId: "doc-1", format: "PDF" }),
        });
        expect(fake.updateMany).toHaveBeenCalledWith(
            { id: "doc-1", deletedAt: null, status: DocumentStatus.PROCESSING },
            expect.objectContaining({ status: DocumentStatus.GENERATED, displayName: "RE-1", isCurrent: true }),
        );
    });

    it("does nothing when the task's document cannot be found", async () => {
        fake.findFirst.mockResolvedValue(null);

        await expect(generateInvoiceDocument("task-1")).rejects.toThrow("for task task-1 was not found");
        expect(fake.buildInvoice).not.toHaveBeenCalled();
    });
});
