import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentFormat, DocumentStatus } from "@prisma/client";

const fake = vi.hoisted(() => {
    const tx = {
        documentArtifact: { create: vi.fn(async (args: { data: Record<string, unknown> }) => args.data) },
    };
    return {
        tx,
        transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
        renderDocument: vi.fn(async () => ({
            docxBuffer: Buffer.from("docx"),
            pdfBuffer: Buffer.from("pdf"),
            model: { hello: "world" },
            modelHash: "hash",
        })),
        storeDocumentArtifacts: vi.fn(async () => ({
            pdf: { objectKey: "pdf-key", size: 1, sha256: "a" },
            docx: { objectKey: "docx-key", size: 1, sha256: "b" },
        })),
        removeDocumentArtifacts: vi.fn(async () => {}),
        documentTableUpdateMany: vi.fn(async (_where: Record<string, unknown>, _data?: Record<string, unknown>) => ({ count: 1 })),
        documentTableFindWithArtifacts: vi.fn(async (): Promise<{ artifacts: { objectKey: string; format: DocumentFormat }[] } | null> => null),
    };
});

vi.mock("../../../lib/prismaClient.js", () => ({ prisma: { $transaction: fake.transaction } }));
vi.mock("../../../lib/render-document.js", () => ({ renderDocument: fake.renderDocument }));
vi.mock("../../../lib/document-artifact-store.js", () => ({
    storeDocumentArtifacts: fake.storeDocumentArtifacts,
    removeDocumentArtifacts: fake.removeDocumentArtifacts,
}));
vi.mock("../document-repo.js", () => ({
    documentTable: () => ({
        scope: "offers",
        updateMany: fake.documentTableUpdateMany,
        findWithArtifacts: fake.documentTableFindWithArtifacts,
    }),
}));

const { runGeneration } = await import("../document-generation.js");

type FakeDoc = {
    id: string;
    status: DocumentStatus;
    sourceVersion: number | null;
    artifacts: { format: DocumentFormat }[];
};

function baseDoc(overrides: Partial<FakeDoc> = {}): FakeDoc {
    return {
        id: "doc-1",
        status: DocumentStatus.PROCESSING,
        sourceVersion: null,
        artifacts: [],
        ...overrides,
    };
}

function baseAdapter(doc: FakeDoc, overrides: Record<string, unknown> = {}) {
    return {
        typeName: "FakeDocument",
        type: "offer" as const,
        findByTask: vi.fn(async () => doc),
        currentParentVersion: vi.fn(() => null as number | null),
        build: vi.fn(async () => ({ language: "DE" as const, data: {}, displayName: "Angebot v1" })),
        templateKind: "OFFER" as const,
        ownerKey: vi.fn(() => ({ documentId: doc.id })),
        recheckNotStale: vi.fn(async () => {}),
        demoteSiblingsWhere: vi.fn(() => ({ offerId: "parent-1", isCurrent: true })),
        ...overrides,
    };
}

describe("runGeneration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fake.documentTableUpdateMany.mockResolvedValue({ count: 1 });
    });

    it("throws when the document for the task cannot be found", async () => {
        const adapter = baseAdapter(baseDoc(), { findByTask: vi.fn(async () => null) });

        await expect(runGeneration("task-1", adapter)).rejects.toThrow("FakeDocument for task task-1 was not found.");
        expect(fake.renderDocument).not.toHaveBeenCalled();
    });

    it("returns early without rendering when the document already has both artifacts", async () => {
        const doc = baseDoc({
            status: DocumentStatus.GENERATED,
            artifacts: [{ format: DocumentFormat.PDF }, { format: DocumentFormat.DOCX }],
        });
        const adapter = baseAdapter(doc);

        await runGeneration("task-1", adapter);

        expect(fake.renderDocument).not.toHaveBeenCalled();
        expect(fake.transaction).not.toHaveBeenCalled();
    });

    it("refuses to render a document that is already stale before building", async () => {
        const doc = baseDoc({ sourceVersion: 3 });
        const adapter = baseAdapter(doc, { currentParentVersion: vi.fn(() => 4) });

        await expect(runGeneration("task-1", adapter)).rejects.toThrow("doc-1 is stale and must be regenerated.");
        expect(fake.renderDocument).not.toHaveBeenCalled();
    });

    it("builds, renders, stores, and finalizes on the happy path", async () => {
        const doc = baseDoc({ sourceVersion: 3 });
        const adapter = baseAdapter(doc, { currentParentVersion: vi.fn(() => 3) });

        await runGeneration("task-1", adapter);

        expect(adapter.build).toHaveBeenCalledWith(doc);
        expect(fake.renderDocument).toHaveBeenCalledWith(
            "OFFER",
            "DE",
            {},
            { documentType: "offer", documentId: "doc-1" },
            { schema: undefined },
        );
        expect(fake.storeDocumentArtifacts).toHaveBeenCalledWith("offers", "doc-1", expect.anything(), expect.anything(), "task-1");
        expect(adapter.recheckNotStale).toHaveBeenCalledWith(fake.tx, doc);
        expect(fake.documentTableUpdateMany).toHaveBeenCalledWith(
            { offerId: "parent-1", isCurrent: true },
            { isCurrent: false },
        );
        expect(fake.tx.documentArtifact.create).toHaveBeenCalledTimes(2);
        expect(fake.documentTableUpdateMany).toHaveBeenCalledWith(
            { id: "doc-1", deletedAt: null, status: DocumentStatus.PROCESSING },
            expect.objectContaining({ status: DocumentStatus.GENERATED, displayName: "Angebot v1", isCurrent: true, error: null }),
        );
    });

    it("never calls recheckNotStale when sourceVersion is null", async () => {
        const doc = baseDoc({ sourceVersion: null });
        const adapter = baseAdapter(doc);

        await runGeneration("task-1", adapter);

        expect(adapter.recheckNotStale).not.toHaveBeenCalled();
    });

    it("rolls back cleanly when the finalize update matches nothing", async () => {
        fake.documentTableUpdateMany.mockImplementation(async (where: Record<string, unknown>) => (
            "status" in where ? { count: 0 } : { count: 1 }
        ));
        fake.documentTableFindWithArtifacts.mockResolvedValue({ artifacts: [] });
        const doc = baseDoc();
        const adapter = baseAdapter(doc);

        await expect(runGeneration("task-1", adapter)).rejects.toThrow("doc-1 is no longer processing.");
        expect(fake.removeDocumentArtifacts).toHaveBeenCalled();
    });

    it("cleans up stored files when generation becomes stale mid-transaction", async () => {
        const doc = baseDoc({ sourceVersion: 3 });
        const error = new Error("OfferDocument doc-1 became stale during generation.");
        const adapter = baseAdapter(doc, {
            currentParentVersion: vi.fn(() => 3),
            recheckNotStale: vi.fn(async () => { throw error; }),
        });
        fake.documentTableFindWithArtifacts.mockResolvedValue({ artifacts: [] });

        await expect(runGeneration("task-1", adapter)).rejects.toThrow(error);
        expect(fake.removeDocumentArtifacts).toHaveBeenCalled();
    });
});
