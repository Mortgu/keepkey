import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    offerDocumentFindFirst: vi.fn(),
    offerDocumentFindUnique: vi.fn(),
    orderDocumentFindFirst: vi.fn(),
    orderDocumentFindUnique: vi.fn(),
    transaction: vi.fn(),
    documentCreate: vi.fn(),
    offerDocumentUpdateMany: vi.fn(),
    orderDocumentUpdateMany: vi.fn(),
    offerFindUnique: vi.fn(),
    orderFindUnique: vi.fn(),
    runPipeline: vi.fn(),
    storeDocumentArtifacts: vi.fn(),
    removeDocumentArtifacts: vi.fn(),
    loggerError: vi.fn(),
    queryRaw: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offerDocument: {
            findFirst: mocks.offerDocumentFindFirst,
            findUnique: mocks.offerDocumentFindUnique,
        },
        orderDocument: {
            findFirst: mocks.orderDocumentFindFirst,
            findUnique: mocks.orderDocumentFindUnique,
        },
        $transaction: mocks.transaction,
    },
}));

vi.mock("../lib/document-artifact-store.js", () => ({
    storeDocumentArtifacts: mocks.storeDocumentArtifacts,
    removeDocumentArtifacts: mocks.removeDocumentArtifacts,
}));

vi.mock("../pipelines/offer/stages.js", () => ({ offerStages: ["offer-stage"] }));
vi.mock("../pipelines/order/stages.js", () => ({ orderStages: ["order-stage"] }));
vi.mock("../pipelines/pipeline.js", () => ({
    PipelineStageError: class PipelineStageError extends Error {},
    runPipeline: mocks.runPipeline,
}));
vi.mock("../middlewares/logger.js", () => ({
    default: { error: mocks.loggerError },
}));

import { generateOfferDocument, generateOrderDocument } from "./document-generation.service.js";

const files = {
    pdf: {
        objectKey: "generated/offers/document-1/generation-1.pdf",
        size: 3,
        sha256: "pdf-hash",
    },
    docx: {
        objectKey: "generated/offers/document-1/generation-1.docx",
        size: 4,
        sha256: "docx-hash",
    },
};

describe("document generation service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.runPipeline.mockResolvedValue({
            displayName: "generated-document",
            docxBuffer: Buffer.from("docx"),
            pdfBuffer: Buffer.from("pdf"),
        });
        mocks.storeDocumentArtifacts.mockResolvedValue(files);
        mocks.documentCreate.mockImplementation(({ data }) => Promise.resolve({
            id: data.format === "PDF" ? "pdf-1" : "docx-1",
        }));
        mocks.transaction.mockImplementation(async (callback) => callback({
            $queryRaw: mocks.queryRaw,
            document: { create: mocks.documentCreate },
            offer: { findUniqueOrThrow: mocks.offerFindUnique },
            order: { findUniqueOrThrow: mocks.orderFindUnique },
            offerDocument: { updateMany: mocks.offerDocumentUpdateMany },
            orderDocument: { updateMany: mocks.orderDocumentUpdateMany },
        }));
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.offerDocumentFindUnique.mockResolvedValue(null);
        mocks.orderDocumentFindUnique.mockResolvedValue(null);
        mocks.offerFindUnique.mockResolvedValue({ version: 1 });
        mocks.orderFindUnique.mockResolvedValue({ version: 1 });
        mocks.queryRaw.mockResolvedValue([{ lock: null }]);
    });

    it("generiert ein Offer-Dokument nur einmal und finalisiert es atomar", async () => {
        let status = "PROCESSING";
        mocks.offerDocumentFindFirst.mockImplementation(() => Promise.resolve({
            id: "document-1",
            offerId: "offer-1",
            version: 2,
            status,
            pdfId: status === "GENERATED" ? "pdf-1" : null,
            docxId: status === "GENERATED" ? "docx-1" : null,
        }));
        mocks.offerDocumentUpdateMany.mockImplementation(() => {
            status = "GENERATED";
            return Promise.resolve({ count: 1 });
        });

        await generateOfferDocument("task-1");
        await generateOfferDocument("task-1");

        expect(mocks.runPipeline).toHaveBeenCalledWith({
            offerId: "offer-1",
            version: 2,
            docxBuffer: null,
            pdfBuffer: null,
            displayName: null,
        }, ["offer-stage"]);
        expect(mocks.storeDocumentArtifacts).toHaveBeenCalledWith(
            "offers",
            "document-1",
            Buffer.from("docx"),
            Buffer.from("pdf"),
            "task-1",
        );
        expect(mocks.runPipeline).toHaveBeenCalledOnce();
        expect(mocks.storeDocumentArtifacts).toHaveBeenCalledOnce();
        expect(mocks.documentCreate).toHaveBeenCalledTimes(2);
        expect(mocks.transaction).toHaveBeenCalledOnce();
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: { offerId: "offer-1", isCurrent: true },
            data: { isCurrent: false },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenLastCalledWith({
            where: { id: "document-1", deletedAt: null, status: "PROCESSING" },
            data: {
                pdfId: "pdf-1",
                docxId: "docx-1",
                status: "GENERATED",
                displayName: "generated-document",
                error: null,
                isCurrent: true,
            },
        });
    });

    it("generiert und finalisiert ein Order-Dokument in einer Transaktion", async () => {
        mocks.orderDocumentFindFirst.mockResolvedValue({
            id: "document-1",
            orderId: "order-1",
            version: 3,
            status: "PROCESSING",
            pdfId: null,
            docxId: null,
        });

        await generateOrderDocument("task-1");

        expect(mocks.runPipeline).toHaveBeenCalledWith({
            orderId: "order-1",
            version: 3,
            docxBuffer: null,
            pdfBuffer: null,
            displayName: null,
        }, ["order-stage"]);
        expect(mocks.transaction).toHaveBeenCalledOnce();
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: { orderId: "order-1", isCurrent: true },
            data: { isCurrent: false },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenLastCalledWith({
            where: { id: "document-1", deletedAt: null, status: "PROCESSING" },
            data: {
                pdfId: "pdf-1",
                docxId: "docx-1",
                status: "GENERATED",
                displayName: "generated-document",
                error: null,
                isCurrent: true,
            },
        });
    });

    it("schlägt bei einem fehlenden fachlichen Dokument fehl", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue(null);
        mocks.orderDocumentFindFirst.mockResolvedValue(null);

        await expect(generateOfferDocument("missing-offer")).rejects.toThrow(
            "OfferDocument for task missing-offer was not found.",
        );
        await expect(generateOrderDocument("missing-order")).rejects.toThrow(
            "OrderDocument for task missing-order was not found.",
        );
        expect(mocks.runPipeline).not.toHaveBeenCalled();
    });

    it("überspringt bereits generierte oder hochgeladene Dokumente", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "offer-document-1",
            status: "UPLOADED",
            pdfId: "pdf-1",
            docxId: "docx-1",
        });
        mocks.orderDocumentFindFirst.mockResolvedValue({
            id: "order-document-1",
            status: "GENERATED",
            pdfId: "pdf-2",
            docxId: "docx-2",
        });

        await generateOfferDocument("offer-task");
        await generateOrderDocument("order-task");

        expect(mocks.runPipeline).not.toHaveBeenCalled();
        expect(mocks.storeDocumentArtifacts).not.toHaveBeenCalled();
        expect(mocks.transaction).not.toHaveBeenCalled();
    });

    it("entfernt neue Artefakte, wenn die DB-Finalisierung fehlschlägt", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "document-1",
            offerId: "offer-1",
            version: 1,
            status: "PROCESSING",
            pdfId: null,
            docxId: null,
        });
        mocks.transaction.mockRejectedValue(new Error("transaction failed"));

        await expect(generateOfferDocument("task-1")).rejects.toThrow("transaction failed");

        expect(mocks.removeDocumentArtifacts).toHaveBeenCalledWith(files);
    });

    it("behält Artefakte, wenn ein Commit trotz Clientfehler erfolgreich war", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "document-1",
            offerId: "offer-1",
            version: 1,
            status: "PROCESSING",
            pdfId: null,
            docxId: null,
        });
        mocks.transaction.mockRejectedValue(new Error("connection lost after commit"));
        mocks.offerDocumentFindUnique.mockResolvedValue({
            pdf: { objectKey: files.pdf.objectKey },
            docx: { objectKey: files.docx.objectKey },
        });

        await expect(generateOfferDocument("task-1")).resolves.toBeUndefined();

        expect(mocks.removeDocumentArtifacts).not.toHaveBeenCalled();
    });

    it("weist partielle Artefaktlinks als inkonsistent zurück", async () => {
        mocks.orderDocumentFindFirst.mockResolvedValue({
            id: "document-1",
            orderId: "order-1",
            version: 1,
            status: "FAILED",
            pdfId: "pdf-1",
            docxId: null,
        });

        await expect(generateOrderDocument("task-1")).rejects.toThrow(
            "OrderDocument document-1 has incomplete artifact links.",
        );
        expect(mocks.runPipeline).not.toHaveBeenCalled();
    });

    it("verwirft ein Dokument, dessen Geschäftsversion veraltet ist", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "document-1",
            offerId: "offer-1",
            version: 2,
            sourceVersion: 3,
            offer: { version: 4 },
            status: "PROCESSING",
            pdfId: null,
            docxId: null,
        });

        await expect(generateOfferDocument("task-1")).rejects.toThrow(
            "OfferDocument document-1 is stale and must be regenerated.",
        );
        expect(mocks.runPipeline).not.toHaveBeenCalled();
    });
});
