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
    uploadOfferDocument: vi.fn(),
    uploadOrderDocument: vi.fn(),
}));
vi.mock("./document-generation-request.service.js", () => ({
    requestOfferGeneration: vi.fn(),
    requestOrderGeneration: vi.fn(),
}));

import { deleteOffer, deleteOfferDocument } from "./offer.service.js";
import { deleteOrderById, deleteOrderDocument } from "./order.service.js";

describe("document retention", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.offerDocumentFindFirst.mockResolvedValue({ id: "offer-document-1", status: "GENERATED" });
        mocks.orderDocumentFindFirst.mockResolvedValue({ id: "order-document-1", status: "UPLOADED" });
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.offerDocumentCount.mockResolvedValue(0);
        mocks.orderDocumentCount.mockResolvedValue(0);
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

    it("soft deletes offer and order documents without deleting artifact rows", async () => {
        await deleteOfferDocument("offer-1", "offer-document-1");
        await deleteOrderDocument("order-1", "order-document-1");

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
