import type { Job } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskJobData } from "./task-queue.js";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    taskUpdateMany: vi.fn(),
    offerDocumentUpdateMany: vi.fn(),
    orderDocumentUpdateMany: vi.fn(),
    loggerError: vi.fn(),
    loggerWarn: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        $transaction: mocks.transaction,
        task: { updateMany: mocks.taskUpdateMany },
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
        mocks.taskUpdateMany.mockResolvedValue({ count: 1 });
        mocks.offerDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderDocumentUpdateMany.mockResolvedValue({ count: 1 });
        mocks.transaction.mockImplementation(async (input) => {
            if (typeof input !== "function") return [];
            return input({
                task: { updateMany: mocks.taskUpdateMany },
                offerDocument: { updateMany: mocks.offerDocumentUpdateMany },
                orderDocument: { updateMany: mocks.orderDocumentUpdateMany },
            });
        });
    });

    it("setzt Task und Dokument beim Start atomar in Bearbeitung", async () => {
        await expect(markTaskRunning("task-1", "run-1")).resolves.toBe(true);

        expect(mocks.taskUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "task-1",
                status: { in: ["PENDING", "RUNNING", "FAILED"] },
            },
            data: {
                status: "RUNNING",
                error: null,
                runToken: "run-1",
            },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                taskId: "task-1",
                status: { in: ["PENDING", "PROCESSING", "FAILED"] },
                artifacts: { none: {} },
            },
            data: { status: "PROCESSING", error: null },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                taskId: "task-1",
                status: { in: ["PENDING", "PROCESSING", "FAILED"] },
                artifacts: { none: {} },
            },
            data: { status: "PROCESSING", error: null },
        });
        expect(mocks.transaction).toHaveBeenCalledOnce();
    });

    it("setzt einen erfolgreichen Task auf COMPLETED und entfernt alte Fehler", async () => {
        await markTaskCompleted("task-1", "run-1");

        expect(mocks.taskUpdateMany).toHaveBeenCalledWith({
            where: { id: "task-1", status: "RUNNING", runToken: "run-1" },
            data: { status: "COMPLETED", error: null, runToken: null },
        });
    });

    it("beansprucht einen bereits abgeschlossenen Task nicht erneut", async () => {
        mocks.taskUpdateMany.mockResolvedValueOnce({ count: 0 });

        await expect(markTaskRunning("task-1", "run-1")).resolves.toBe(false);

        expect(mocks.offerDocumentUpdateMany).not.toHaveBeenCalled();
        expect(mocks.orderDocumentUpdateMany).not.toHaveBeenCalled();
    });

    it.each([1, 2])("persistiert nach Versuch %i noch keinen Fehler", async (attemptsMade) => {
        await handleTaskFailure(createJob(attemptsMade), new Error("temporary"));

        expect(mocks.transaction).not.toHaveBeenCalled();
        expect(mocks.taskUpdateMany).not.toHaveBeenCalled();
        expect(mocks.loggerWarn).toHaveBeenCalledWith(
            expect.stringContaining(`attempt ${attemptsMade}/3 failed and will be retried`),
        );
    });

    it("persistiert nur einen terminalen Fehler atomar", async () => {
        await handleTaskFailure(createJob(1, Date.now()), new Error("terminal"));

        expect(mocks.taskUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "task-1",
                status: { in: ["RUNNING", "FAILED"] },
                runToken: null,
            },
            data: { status: "FAILED", error: "terminal", runToken: null },
        });
        expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                taskId: "task-1",
                status: { in: ["PENDING", "PROCESSING", "FAILED"] },
                artifacts: { none: {} },
            },
            data: { status: "FAILED", error: "terminal" },
        });
        expect(mocks.orderDocumentUpdateMany).toHaveBeenCalledWith({
            where: {
                taskId: "task-1",
                status: { in: ["PENDING", "PROCESSING", "FAILED"] },
                artifacts: { none: {} },
            },
            data: { status: "FAILED", error: "terminal" },
        });
        expect(mocks.transaction).toHaveBeenCalledOnce();
    });
});
