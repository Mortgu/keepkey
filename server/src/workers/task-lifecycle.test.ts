import type { Job } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskJobData } from "./task-queue.js";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    taskUpdate: vi.fn(),
    offerDocumentUpdateMany: vi.fn(),
    orderDocumentUpdateMany: vi.fn(),
    loggerError: vi.fn(),
    loggerWarn: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        $transaction: mocks.transaction,
        task: { update: mocks.taskUpdate },
        offerDocument: { updateMany: mocks.offerDocumentUpdateMany },
        orderDocument: { updateMany: mocks.orderDocumentUpdateMany },
    },
}));

vi.mock("../middlewares/logger.js", () => ({
    default: {
        error: mocks.loggerError,
        warn: mocks.loggerWarn,
    },
}));

import { handleTaskFailure, markTaskCompleted, markTaskRunning } from "./task-lifecycle.js";

const createJob = (attemptsMade: number, finishedOn?: number) => ({
    data: { taskId: "task-1" },
    attemptsMade,
    finishedOn,
    opts: { attempts: 3 },
}) as Job<TaskJobData>;

describe("task lifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.transaction.mockResolvedValue([]);
    });

    it("setzt Task und Dokument beim Start atomar in Bearbeitung", async () => {
        await markTaskRunning("task-1");

        expect(mocks.taskUpdate).toHaveBeenCalledWith({
            where: { id: "task-1" },
            data: { status: "RUNNING", error: null },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: { taskId: "task-1" },
            data: { status: "PROCESSING", error: null },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: { taskId: "task-1" },
            data: { status: "PROCESSING", error: null },
        });
        expect(mocks.transaction).toHaveBeenCalledOnce();
    });

    it("setzt einen erfolgreichen Task auf COMPLETED und entfernt alte Fehler", async () => {
        await markTaskCompleted("task-1");

        expect(mocks.taskUpdate).toHaveBeenCalledWith({
            where: { id: "task-1" },
            data: { status: "COMPLETED", error: null },
        });
    });

    it.each([1, 2])("persistiert nach Versuch %i noch keinen Fehler", async (attemptsMade) => {
        await handleTaskFailure(createJob(attemptsMade), new Error("temporary"));

        expect(mocks.transaction).not.toHaveBeenCalled();
        expect(mocks.taskUpdate).not.toHaveBeenCalled();
        expect(mocks.loggerWarn).toHaveBeenCalledWith(
            expect.stringContaining(`attempt ${attemptsMade}/3 failed and will be retried`),
        );
    });

    it("persistiert nur einen terminalen Fehler atomar", async () => {
        await handleTaskFailure(createJob(1, Date.now()), new Error("terminal"));

        expect(mocks.taskUpdate).toHaveBeenCalledWith({
            where: { id: "task-1" },
            data: { status: "FAILED", error: "terminal" },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: { taskId: "task-1" },
            data: { status: "FAILED", error: "terminal" },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: { taskId: "task-1" },
            data: { status: "FAILED", error: "terminal" },
        });
        expect(mocks.transaction).toHaveBeenCalledOnce();
    });
});
