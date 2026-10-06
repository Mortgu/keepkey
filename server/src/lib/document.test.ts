import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("./prismaClient.js", () => ({
    prisma: {
        $transaction: vi.fn(async () => []),
        task: { updateMany: vi.fn(), update: vi.fn() },
        offerDocument: { updateMany: vi.fn() },
        orderDocument: { updateMany: vi.fn() },
        confirmationDocument: { updateMany: vi.fn() },
        invoiceDocument: { updateMany: vi.fn() },
    },
}));

import { closeTaskQueue } from "../workers/task-queue.js";
import { enqueueTask } from "./document.js";
import { prisma } from "./prismaClient.js";

describe("enqueueTask without Redis", () => {
    afterAll(async () => {
        await closeTaskQueue();
    });

    // REDIS_URL zeigt in den Tests auf einen geschlossenen Port.
    it("fails with 503 within the enqueue timeout instead of hanging", async () => {
        const startedAt = Date.now();

        await expect(enqueueTask("task-1")).rejects.toMatchObject({
            statusCode: 503,
            code: "TASK_ENQUEUE_FAILED",
        });

        expect(Date.now() - startedAt).toBeLessThan(2_000);
        expect(prisma.$transaction).toHaveBeenCalledOnce();
    });
});
