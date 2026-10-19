import { beforeEach, describe, expect, it, vi } from "vitest";

const offerDocumentFindFirst = vi.fn();
const offerDocumentFindUnique = vi.fn();
const offerDocumentUpdateMany = vi.fn();
const documentArtifactUpdateMany = vi.fn();
const moveDocumentArtifact = vi.fn();
const deleteDocumentArtifact = vi.fn();
const uploadGeneratedDocument = vi.fn();
const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

vi.mock("../../lib/prismaClient.js", () => {
    // `documentTable()` routes to a different Prisma model per `DocumentType`;
    // tests here use both "offer" (to exercise the offer-lock guard, including
    // its `findUnique`-based `assertEditable`) and "confirmation" (to exercise
    // the type-generic behaviour) against the same spies, since the two
    // tables are structurally identical.
    const updateManySpy = { updateMany: (...args: unknown[]) => offerDocumentUpdateMany(...args) };
    const findFirstSpy = { findFirst: (...args: unknown[]) => offerDocumentFindFirst(...args) };
    const offerDocumentSpy = {
        findFirst: (...args: unknown[]) => offerDocumentFindFirst(...args),
        findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args),
    };
    const tx = {
        offerDocument: updateManySpy,
        confirmationDocument: updateManySpy,
        documentArtifact: {
            update: vi.fn(),
            updateMany: (...args: unknown[]) => documentArtifactUpdateMany(...args),
        },
    };
    return {
        prisma: {
            offerDocument: offerDocumentSpy,
            confirmationDocument: findFirstSpy,
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

const { renameDocument, deleteDocument, resyncDocument } = await import("./document-lifecycle.js");

describe("offer document mutations once the offer is accepted", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        offerDocumentFindFirst.mockResolvedValue({ id: "doc-1", status: "GENERATED", artifacts: [] });
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: new Date() } });
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
        offerDocumentFindFirst.mockResolvedValue(uploadedDocument);
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
        expect(offerDocumentUpdateMany).not.toHaveBeenCalled();
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
        offerDocumentFindFirst.mockResolvedValue(uploadedDocument);
    });

    it("clears the remote trace and re-uploads", async () => {
        offerDocumentUpdateMany.mockResolvedValue({ count: 1 });

        await resyncDocument("confirmation", "doc-1");

        expect(deleteDocumentArtifact).toHaveBeenCalledWith("old/name.pdf");
        expect(deleteDocumentArtifact).toHaveBeenCalledWith("old/name.docx");
        expect(offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: { id: "doc-1", deletedAt: null, status: "UPLOADED" },
            data: { status: "GENERATED" },
        });
        expect(documentArtifactUpdateMany).toHaveBeenCalledWith({
            where: { id: { in: ["a-pdf", "a-docx"] } },
            data: { remotePath: null, remoteEtag: null, uploadedAt: null, remoteSha256: null },
        });
        expect(uploadGeneratedDocument).toHaveBeenCalledWith("confirmation", "doc-1");
    });

    it("rejects when the document changed in the meantime", async () => {
        offerDocumentUpdateMany.mockResolvedValue({ count: 0 });

        await expect(resyncDocument("confirmation", "doc-1")).rejects.toMatchObject({
            code: "DOCUMENT_STATE_CHANGED",
            statusCode: 409,
        });
        expect(uploadGeneratedDocument).not.toHaveBeenCalled();
    });
});
