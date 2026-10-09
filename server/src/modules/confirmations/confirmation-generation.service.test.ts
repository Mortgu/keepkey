import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
    const tx = {
        $queryRaw: vi.fn(async () => []),
        confirmationDocument: {
            findFirst: vi.fn(async (): Promise<unknown> => null),
            findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []),
            create: vi.fn(async () => ({})),
        },
        task: { create: vi.fn(async () => ({ id: "task-new" })) },
    };
    return {
        tx,
        confirmation: { findUnique: vi.fn(async (): Promise<unknown> => ({ id: "conf-1", order: { cancelledAt: null } })) },
        enqueueTask: vi.fn(async () => {}),
        deleteDocument: vi.fn(async () => {}),
    };
});

vi.mock("@/core/prisma.js", () => ({
    prisma: {
        confirmation: fake.confirmation,
        $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(fake.tx)),
    },
}));
vi.mock("@/modules/documents/generation/enqueue-task.js", () => ({ enqueueTask: fake.enqueueTask }));
vi.mock("@/modules/documents/document.service.js", () => ({ deleteDocument: fake.deleteDocument }));

import { requestConfirmationGeneration } from "./confirmation-generation.service.js";

describe("requestConfirmationGeneration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fake.tx.confirmationDocument.findFirst.mockResolvedValue(null);
        fake.tx.confirmationDocument.findMany.mockResolvedValue([]);
        fake.confirmation.findUnique.mockResolvedValue({ id: "conf-1", order: { cancelledAt: null } });
    });

    it("creates task + pending document and enqueues it", async () => {
        const task = await requestConfirmationGeneration("conf-1");

        expect(task.id).toBe("task-new");
        expect(fake.tx.task.create).toHaveBeenCalledWith({
            data: { status: "PENDING", type: "GENERATION", target: "CONFIRMATION" },
        });
        expect(fake.tx.confirmationDocument.create).toHaveBeenCalledWith({
            data: { confirmationId: "conf-1", status: "PENDING", taskId: "task-new" },
        });
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-new", { markFailedOnError: true });
        expect(fake.deleteDocument).not.toHaveBeenCalled();
    });

    it("replaces the previous document instead of versioning", async () => {
        fake.tx.confirmationDocument.findMany.mockResolvedValue([{ id: "doc-old" }]);

        await requestConfirmationGeneration("conf-1");

        expect(fake.deleteDocument).toHaveBeenCalledWith("confirmation", "doc-old");
        expect(fake.tx.confirmationDocument.create).toHaveBeenCalledOnce();
    });

    it("re-uses a running generation and does not touch existing documents", async () => {
        fake.tx.confirmationDocument.findFirst.mockResolvedValue({ task: { id: "task-active" } });
        fake.tx.confirmationDocument.findMany.mockResolvedValue([{ id: "doc-old" }]);

        const task = await requestConfirmationGeneration("conf-1");

        expect(task.id).toBe("task-active");
        expect(fake.tx.task.create).not.toHaveBeenCalled();
        expect(fake.deleteDocument).not.toHaveBeenCalled();
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-active", { markFailedOnError: false });
    });

    it("refuses cancelled orders and unknown confirmations", async () => {
        fake.confirmation.findUnique.mockResolvedValue({ id: "conf-1", order: { cancelledAt: new Date() } });
        await expect(requestConfirmationGeneration("conf-1")).rejects.toMatchObject({ code: "ORDER_CANCELLED" });

        fake.confirmation.findUnique.mockResolvedValue(null);
        await expect(requestConfirmationGeneration("nope")).rejects.toMatchObject({ statusCode: 404 });
        expect(fake.enqueueTask).not.toHaveBeenCalled();
    });
});
