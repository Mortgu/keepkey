import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    queueAdd: vi.fn(),
    queueGetJob: vi.fn(),
    taskUpdate: vi.fn(),
    taskUpdateMany: vi.fn(),
    transaction: vi.fn(),
    offerDocumentUpdateMany: vi.fn(),
    orderDocumentUpdateMany: vi.fn(),
    loggerWarn: vi.fn(),
    loggerError: vi.fn(),
}));

vi.mock("../workers/task-queue.js", () => ({
    taskQueueKey: "task-queue",
    taskQueue: { add: mocks.queueAdd, getJob: mocks.queueGetJob },
}));

vi.mock("./prismaClient.js", () => ({
    prisma: {
        $transaction: mocks.transaction,
        task: { update: mocks.taskUpdate, updateMany: mocks.taskUpdateMany },
        offerDocument: { updateMany: mocks.offerDocumentUpdateMany },
        orderDocument: { updateMany: mocks.orderDocumentUpdateMany },
    },
}));

vi.mock("../middlewares/logger.js", () => ({
    default: { warn: mocks.loggerWarn, error: mocks.loggerError },
}));

import { enqueueTask } from "./document.js";

describe("enqueueTask", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.queueAdd.mockResolvedValue({ id: "task-1" });
        mocks.queueGetJob.mockResolvedValue(undefined);
        mocks.taskUpdate.mockResolvedValue({});
        mocks.taskUpdateMany.mockResolvedValue({ count: 1 });
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderDocumentUpdateMany.mockResolvedValue({ count: 0 });
        mocks.transaction.mockResolvedValue([]);
    });

    it("reaktiviert einen bestehenden terminal fehlgeschlagenen Job", async () => {
        const retry = vi.fn().mockResolvedValue(undefined);
        mocks.queueGetJob.mockResolvedValue({
            id: "task-1",
            getState: vi.fn().mockResolvedValue("failed"),
            retry,
        });

        await enqueueTask("task-1", { markFailedOnError: false });

        expect(retry).toHaveBeenCalledWith("failed");
        expect(mocks.queueAdd).not.toHaveBeenCalled();
        expect(mocks.taskUpdate).toHaveBeenCalledWith({
            where: { id: "task-1" },
            data: { jobId: "task-1" },
        });
    });

    it("setzt einen inkonsistent abgeschlossenen Recovery-Task vor dem Retry zurück", async () => {
        const retry = vi.fn().mockResolvedValue(undefined);
        mocks.queueGetJob.mockResolvedValue({
            id: "task-1",
            getState: vi.fn().mockResolvedValue("completed"),
            retry,
        });

        await enqueueTask("task-1", { markFailedOnError: false });

        expect(mocks.taskUpdateMany).toHaveBeenCalledWith({
            where: { id: "task-1", status: "COMPLETED" },
            data: { status: "PENDING", error: null, runToken: null },
        });
        expect(retry).toHaveBeenCalledWith("completed");
    });

    it("verwendet die Task-ID als deterministische BullMQ-Job-ID", async () => {
        await enqueueTask("task-1");

        expect(mocks.queueAdd).toHaveBeenCalledWith(
            "task-queue",
            { taskId: "task-1" },
            { jobId: "task-1" },
        );
        expect(mocks.taskUpdate).toHaveBeenCalledWith({
            where: { id: "task-1" },
            data: { jobId: "task-1" },
        });
    });

    it("setzt einen neu erstellten Task bei einem Queue-Fehler atomar auf FAILED", async () => {
        mocks.queueAdd.mockRejectedValue(new Error("redis unavailable"));

        await expect(enqueueTask("task-1")).rejects.toMatchObject({ code: "TASK_ENQUEUE_FAILED" });

        expect(mocks.transaction).toHaveBeenCalledOnce();
        expect(mocks.taskUpdateMany).toHaveBeenCalledWith({
            where: { id: "task-1", status: "PENDING" },
            data: { status: "FAILED", error: "redis unavailable" },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: { taskId: "task-1", status: "PENDING" },
            data: { status: "FAILED", error: "redis unavailable" },
        });
    });

    it("verändert einen bestehenden aktiven Task bei einem Recovery-Fehler nicht", async () => {
        mocks.queueAdd.mockRejectedValue(new Error("redis unavailable"));

        await expect(enqueueTask("task-1", { markFailedOnError: false }))
            .rejects.toMatchObject({ code: "TASK_ENQUEUE_FAILED" });

        expect(mocks.transaction).not.toHaveBeenCalled();
        expect(mocks.taskUpdateMany).not.toHaveBeenCalled();
    });
});
