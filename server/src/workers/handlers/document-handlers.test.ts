import type { Task } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    documentCreate: vi.fn(),
    offerDocumentFindFirst: vi.fn(),
    offerDocumentUpdate: vi.fn(),
    orderDocumentFindFirst: vi.fn(),
    orderDocumentUpdate: vi.fn(),
    runPipeline: vi.fn(),
    createDocumentFiles: vi.fn(),
}));

vi.mock("../../lib/prismaClient.js", () => ({
    prisma: {
        document: { create: mocks.documentCreate },
        offerDocument: {
            findFirst: mocks.offerDocumentFindFirst,
            update: mocks.offerDocumentUpdate,
        },
        orderDocument: {
            findFirst: mocks.orderDocumentFindFirst,
            update: mocks.orderDocumentUpdate,
        },
    },
}));

vi.mock("../../pipelines/pipeline.js", () => ({
    runPipeline: mocks.runPipeline,
}));

vi.mock("../../pipelines/offer/stages.js", () => ({ offerStages: [] }));
vi.mock("../../pipelines/order/stages.js", () => ({ orderStages: [] }));
vi.mock("../task-worker.js", () => ({
    createDocumentFiles: mocks.createDocumentFiles,
}));
vi.mock("../../middlewares/logger.js", () => ({
    default: { error: vi.fn(), warn: vi.fn() },
}));
vi.mock("better-auth", () => ({
    logger: { error: vi.fn(), warn: vi.fn() },
}));

import offerTaskHandler from "./offer-handler.js";
import orderTaskHandler from "./order-handler.js";

const task = { id: "task-1" } as Task;

describe("document task handlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.runPipeline.mockResolvedValue({
            displayName: "generated-document",
            docxBuffer: Buffer.from("docx"),
            pdfBuffer: Buffer.from("pdf"),
        });
        mocks.createDocumentFiles.mockReturnValue({
            displayName: "generated-document",
            pdf: { filename: "document.pdf", basename: "document.pdf", path: "uploads" },
            docx: { filename: "document.docx", basename: "document.docx", path: "uploads" },
        });
        mocks.documentCreate
            .mockResolvedValueOnce({ id: "pdf-1" })
            .mockResolvedValueOnce({ id: "docx-1" });
    });

    it("entfernt alte Fehler nach erfolgreicher Offer-Generierung", async () => {
        mocks.offerDocumentFindFirst.mockResolvedValue({
            id: "offer-document-1",
            offerId: "offer-1",
            version: 1,
        });

        await offerTaskHandler(task);

        expect(mocks.offerDocumentUpdate).toHaveBeenCalledWith({
            where: { id: "offer-document-1" },
            data: {
                pdfId: "pdf-1",
                docxId: "docx-1",
                status: "GENERATED",
                displayName: "generated-document",
                error: null,
            },
        });
    });

    it("entfernt alte Fehler nach erfolgreicher Order-Generierung", async () => {
        mocks.orderDocumentFindFirst.mockResolvedValue({
            id: "order-document-1",
            orderId: "order-1",
            version: 1,
        });

        await orderTaskHandler(task);

        expect(mocks.orderDocumentUpdate).toHaveBeenCalledWith({
            where: { id: "order-document-1" },
            data: {
                pdfId: "pdf-1",
                docxId: "docx-1",
                status: "GENERATED",
                displayName: "generated-document",
                error: null,
            },
        });
    });
});
