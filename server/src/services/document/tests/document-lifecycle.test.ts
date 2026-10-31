import { beforeEach, describe, expect, it, vi } from "vitest";

const documentFindFirst = vi.fn();
const ownerFindFirst = vi.fn();
const documentUpdateMany = vi.fn();
const documentArtifactUpdateMany = vi.fn();
const moveDocumentArtifact = vi.fn();
const deleteDocumentArtifact = vi.fn();
const uploadGeneratedDocument = vi.fn();
const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

vi.mock("../../lib/prismaClient.js", () => {
    // `documentTable()` queries the single `document` delegate filtered by
    // `type`. Lookups with a `select` are the facade's owner checks
    // (`assertEditable`: offer `acceptedAt`, confirmation's order
    // `cancelledAt`); everything else loads the document with its artifacts.
    const document = {
        findFirst: (args: { select?: unknown }) => (args.select ? ownerFindFirst(args) : documentFindFirst(args)),
        updateMany: (...args: unknown[]) => documentUpdateMany(...args),
    };
    const tx = {
        document,
        documentArtifact: {
            update: vi.fn(),
            updateMany: (...args: unknown[]) => documentArtifactUpdateMany(...args),
        },
    };
    return {
        prisma: {
            document,
            $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
        },
    };
});
vi.mock("../../lib/document-artifact-store.js", () => ({
    MIME_TYPES: { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    getDocumentDownloadUrl: vi.fn(async () => "https://example.test/download"),
    removeDocumentArtifacts: vi.fn(),
}));
vi.mock("../../lib/nextcloud-document-store.js", () => ({
    RemoteDocumentExistsError: class RemoteDocumentExistsError extends Error {
        remotePath: string;
        constructor(remotePath: string) {
            super(`exists: ${remotePath}`);
            this.remotePath = remotePath;
        }
    },
    deleteDocumentArtifact: (...args: unknown[]) => deleteDocumentArtifact(...args),
    moveDocumentArtifact: (...args: unknown[]) => moveDocumentArtifact(...args),
}));
vi.mock("../document-upload.service.js", () => ({
    uploadGeneratedDocument: (...args: unknown[]) => uploadGeneratedDocument(...args),
}));
vi.mock("@/utils/logger.js", () => ({ default: logger }));

const { renameDocument, deleteDocument, resyncDocument } = await import("../document-lifecycle.js");

describe("offer document mutations once the offer is accepted", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        documentFindFirst.mockResolvedValue({ id: "doc-1", status: "GENERATED", artifacts: [] });
        ownerFindFirst.mockResolvedValue({ offer: { acceptedAt: new Date() } });
    });

    it("renameDocument is rejected", async () => {
        await expect(
            renameDocument("offer", "doc-1", { displayName: "Neuer Name" }),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });

    it("deleteDocument is rejected", async () => {
        await expect(
            deleteDocument("offer", "doc-1"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });
});

describe("confirmation document mutations once the order is cancelled", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        documentFindFirst.mockResolvedValue({ id: "doc-1", status: "GENERATED", artifacts: [] });
        ownerFindFirst.mockResolvedValue({ confirmation: { order: { cancelledAt: new Date() } } });
    });

    it("renameDocument is rejected", async () => {
        await expect(
            renameDocument("confirmation", "doc-1", { displayName: "Neuer Name" }),
        ).rejects.toMatchObject({ code: "ORDER_CANCELLED", statusCode: 409 });
    });

    it("deleteDocument is rejected", async () => {
        await expect(
            deleteDocument("confirmation", "doc-1"),
        ).rejects.toMatchObject({ code: "ORDER_CANCELLED", statusCode: 409 });
    });
});

describe("renameDocument moves an uploaded pair and rolls back on partial failure", () => {
    const uploadedDocument = {
        id: "doc-1",
        status: "UPLOADED",
        artifacts: [
            { id: "a-pdf", format: "PDF", remotePath: "old/name.pdf" },
            { id: "a-docx", format: "DOCX", remotePath: "old/name.docx" },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        documentFindFirst.mockResolvedValue(uploadedDocument);
        ownerFindFirst.mockResolvedValue({ confirmation: { order: { cancelledAt: null } } });
    });

    it("reverts the PDF move and rethrows when the DOCX move fails", async () => {
        moveDocumentArtifact
            .mockResolvedValueOnce("new/name.pdf")
            .mockRejectedValueOnce(new Error("docx move failed"))
            .mockResolvedValueOnce("old/name.pdf");

        await expect(
            renameDocument("confirmation", "doc-1", { displayName: "Neuer Name" }),
        ).rejects.toThrow("docx move failed");

        expect(moveDocumentArtifact).toHaveBeenNthCalledWith(3, "new/name.pdf", "name.pdf");
        expect(documentUpdateMany).not.toHaveBeenCalled();
    });

    it("reports an inconsistent state when the rollback itself fails", async () => {
        moveDocumentArtifact
            .mockResolvedValueOnce("new/name.pdf")
            .mockRejectedValueOnce(new Error("docx move failed"))
            .mockRejectedValueOnce(new Error("rollback failed"));

        await expect(
            renameDocument("confirmation", "doc-1", { displayName: "Neuer Name" }),
        ).rejects.toMatchObject({ code: "DOCUMENT_RENAME_INCONSISTENT", statusCode: 500 });

        expect(logger.error).toHaveBeenCalledWith(
            "document_rename_rollback_failed",
            expect.objectContaining({ movedTo: "new/name.pdf", expectedAt: "old/name.pdf" }),
        );
    });
});

describe("resyncDocument", () => {
    const uploadedDocument = {
        id: "doc-1",
        status: "UPLOADED",
        artifacts: [
            { id: "a-pdf", format: "PDF", remotePath: "old/name.pdf" },
            { id: "a-docx", format: "DOCX", remotePath: "old/name.docx" },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        documentFindFirst.mockResolvedValue(uploadedDocument);
    });

    it("clears the remote trace and re-uploads", async () => {
        documentUpdateMany.mockResolvedValue({ count: 1 });

        await resyncDocument("confirmation", "doc-1");

        expect(deleteDocumentArtifact).toHaveBeenCalledWith("old/name.pdf");
        expect(deleteDocumentArtifact).toHaveBeenCalledWith("old/name.docx");
        expect(documentUpdateMany).toHaveBeenCalledWith({
            where: { id: "doc-1", deletedAt: null, status: "UPLOADED", type: "CONFIRMATION" },
            data: { status: "GENERATED" },
        });
        expect(documentArtifactUpdateMany).toHaveBeenCalledWith({
            where: { id: { in: ["a-pdf", "a-docx"] } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null, remoteSha256: null },
        });
        expect(uploadGeneratedDocument).toHaveBeenCalledWith("confirmation", "doc-1");
    });

    it("rejects when the document changed in the meantime", async () => {
        documentUpdateMany.mockResolvedValue({ count: 0 });

        await expect(resyncDocument("confirmation", "doc-1")).rejects.toMatchObject({
            code: "DOCUMENT_STATE_CHANGED",
            statusCode: 409,
        });
        expect(uploadGeneratedDocument).not.toHaveBeenCalled();
    });
});
