import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    queryRaw: vi.fn(),
    taskCreate: vi.fn(),
    offerFindFirst: vi.fn(),
    offerUpdate: vi.fn(),
    offerCreate: vi.fn(),
    orderFindFirst: vi.fn(),
    orderUpdate: vi.fn(),
    orderCreate: vi.fn(),
    enqueueTask: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: { $transaction: mocks.transaction },
}));

vi.mock("../lib/document.js", () => ({
    enqueueTask: mocks.enqueueTask,
}));

import { requestOfferGeneration, requestOrderGeneration } from "./document-generation-request.service.js";

const task = {
    id: "task-1",
    jobId: null,
    runToken: null,
    status: "PENDING",
    target: "OFFER",
    type: "GENERATION",
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("document generation request service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.taskCreate.mockResolvedValue(task);
        mocks.queryRaw.mockResolvedValue([{ pg_advisory_xact_lock: null }]);
        mocks.transaction.mockImplementation(async (callback) => callback({
            $queryRaw: mocks.queryRaw,
            task: { create: mocks.taskCreate },
            offerDocument: {
                findFirst: mocks.offerFindFirst,
                create: mocks.offerCreate,
            },
            offer: { update: mocks.offerUpdate },
            orderDocument: {
                findFirst: mocks.orderFindFirst,
                create: mocks.orderCreate,
            },
            order: { update: mocks.orderUpdate },
        }));
    });

    it("serialisiert und erstellt genau die nächste Offer-Version", async () => {
        mocks.offerFindFirst.mockResolvedValueOnce(null);
        mocks.offerUpdate.mockResolvedValue({ documentVersion: 3 });

        const result = await requestOfferGeneration("offer-1", (version) => `offer-v${version}`);

        expect(result).toBe(task);
        expect(mocks.queryRaw).toHaveBeenCalledWith(expect.anything(), "offer-generation:offer-1");
        expect(mocks.taskCreate).toHaveBeenCalledWith({
            data: { status: "PENDING", type: "GENERATION", target: "OFFER" },
        });
        expect(mocks.offerCreate).toHaveBeenCalledWith({
            data: {
                displayName: "offer-v3",
                offerId: "offer-1",
                version: 3,
                isCurrent: false,
                status: "PENDING",
                taskId: "task-1",
            },
        });
        expect(mocks.offerUpdate).toHaveBeenCalledWith({
            where: { id: "offer-1" },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        });
        expect(mocks.enqueueTask).toHaveBeenCalledWith("task-1", { markFailedOnError: true });
    });

    it("gibt den bestehenden aktiven Offer-Task zurück", async () => {
        const activeTask = { ...task, id: "active-task" };
        mocks.offerFindFirst.mockResolvedValueOnce({ task: activeTask });

        const result = await requestOfferGeneration("offer-1", () => "unused");

        expect(result).toBe(activeTask);
        expect(mocks.taskCreate).not.toHaveBeenCalled();
        expect(mocks.offerCreate).not.toHaveBeenCalled();
        expect(mocks.enqueueTask).toHaveBeenCalledWith("active-task", { markFailedOnError: false });
    });

    it("wendet denselben Ablauf auf Order-Versionen an", async () => {
        mocks.orderFindFirst.mockResolvedValueOnce(null);
        mocks.orderUpdate.mockResolvedValue({ documentVersion: 5 });

        await requestOrderGeneration("order-1");

        expect(mocks.queryRaw).toHaveBeenCalledWith(expect.anything(), "order-generation:order-1");
        expect(mocks.orderCreate).toHaveBeenCalledWith({
            data: {
                orderId: "order-1",
                version: 5,
                isCurrent: false,
                status: "PENDING",
                taskId: "task-1",
            },
        });
        expect(mocks.orderUpdate).toHaveBeenCalledWith({
            where: { id: "order-1" },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        });
        expect(mocks.enqueueTask).toHaveBeenCalledWith("task-1", { markFailedOnError: true });
    });
});
