import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    offerDocumentFindFirst: vi.fn(),
    offerDocumentUpdateMany: vi.fn(),
    orderDocumentFindFirst: vi.fn(),
    orderDocumentUpdateMany: vi.fn(),
    transaction: vi.fn(),
    queryRaw: vi.fn(),
    offerFindUniqueOrThrow: vi.fn(),
    offerDelete: vi.fn(),
    offerDocumentCount: vi.fn(),
    orderFindUniqueOrThrow: vi.fn(),
    orderDelete: vi.fn(),
    orderDocumentCount: vi.fn(),
    getDocumentDownloadUrl: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offerDocument: {
            findFirst: mocks.offerDocumentFindFirst,
            updateMany: mocks.offerDocumentUpdateMany,
        },
        orderDocument: {
            findFirst: mocks.orderDocumentFindFirst,
            updateMany: mocks.orderDocumentUpdateMany,
        },
        $transaction: mocks.transaction,
    },
}));

vi.mock("./document-upload.service.js", () => ({
    uploadGeneratedDocument: vi.fn(),
}));
vi.mock("../lib/document-artifact-store.js", () => ({
    getDocumentDownloadUrl: mocks.getDocumentDownloadUrl,
}));
vi.mock("./document-generation-request.service.js", () => ({
    requestOfferGeneration: vi.fn(),
    requestOrderGeneration: vi.fn(),
}));

import { deleteDocument, downloadDocument, renameDocument } from "./documents.service.js";
import { deleteOffer } from "./offer.service.js";
import { deleteOrderById } from "./order.service.js";

describe("document retention", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.offerDocumentFindFirst.mockResolvedValue({ id: "offer-document-1", status: "GENERATED", artifacts: [] });
        mocks.orderDocumentFindFirst.mockResolvedValue({ id: "order-document-1", status: "UPLOADED", artifacts: [] });
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.offerDocumentCount.mockResolvedValue(0);
        mocks.orderDocumentCount.mockResolvedValue(0);
        mocks.getDocumentDownloadUrl.mockResolvedValue("https://storage.example/document");
        mocks.transaction.mockImplementation((callback) => callback({
            $queryRaw: mocks.queryRaw,
            offer: {
                findUniqueOrThrow: mocks.offerFindUniqueOrThrow,
                delete: mocks.offerDelete,
            },
            offerDocument: { count: mocks.offerDocumentCount },
            order: {
                findUniqueOrThrow: mocks.orderFindUniqueOrThrow,
                delete: mocks.orderDelete,
            },
            orderDocument: { count: mocks.orderDocumentCount },
        }));
    });

    it("rejects rename while a document is processing", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "offer-document-1",
            status: "PROCESSING",
            artifacts: [],
        });
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 0 });

        await expect(renameDocument("offer", "offer-document-1", { displayName: "Blocked" }))
            .rejects.toMatchObject({ statusCode: 409, code: "DOCUMENT_NOT_RENAMABLE" });
    });

    it("downloads an artifact selected by format", async () => {
        mocks.orderDocumentFindFirst.mockResolvedValue({
            id: "order-document-1",
            status: "UPLOADED",
            displayName: "Order",
            artifacts: [{ format: "PDF", objectKey: "orders/order-1.pdf" }],
        });

        await expect(downloadDocument("order", "order-document-1", "pdf"))
            .resolves.toEqual({ url: "https://storage.example/document" });
        expect(mocks.getDocumentDownloadUrl).toHaveBeenCalledWith(
            "orders/order-1.pdf",
            "Order.pdf",
            "application/pdf",
        );
    });

    it("soft deletes offer and order documents without deleting artifact rows", async () => {
        await deleteDocument("offer", "offer-document-1");
        await deleteDocument("order", "order-document-1");

        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "offer-document-1",
                deletedAt: null,
                status: { notIn: ["PENDING", "PROCESSING", "UPLOADING"] },
            },
            data: { deletedAt: expect.any(Date), isCurrent: false },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "order-document-1",
                deletedAt: null,
                status: { notIn: ["PENDING", "PROCESSING", "UPLOADING"] },
            },
            data: { deletedAt: expect.any(Date), isCurrent: false },
        });
    });

    it("renames offer and order documents through the shared service", async () => {
        await renameDocument("offer", "offer-document-1", { displayName: "Offer renamed" });
        await renameDocument("order", "order-document-1", { displayName: "Order renamed" });

        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ status: { in: ["GENERATED", "UPLOADED"] } }),
            data: { displayName: "Offer renamed" },
        }));
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ status: { in: ["GENERATED", "UPLOADED"] } }),
            data: { displayName: "Order renamed" },
        }));
    });

    it("blocks hard deletion when an offer or order has document history", async () => {
        mocks.offerDocumentCount.mockResolvedValue(1);
        mocks.orderDocumentCount.mockResolvedValue(1);

        await expect(deleteOffer("offer-1")).rejects.toMatchObject({
            statusCode: 409,
            code: "OFFER_HAS_DOCUMENT_HISTORY",
        });
        await expect(deleteOrderById("order-1")).rejects.toMatchObject({
            statusCode: 409,
            code: "ORDER_HAS_DOCUMENT_HISTORY",
        });
        expect(mocks.offerDelete).not.toHaveBeenCalled();
        expect(mocks.orderDelete).not.toHaveBeenCalled();
    });
});
