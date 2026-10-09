import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
    const tx = {
        $queryRaw: vi.fn(async () => []),
        invoiceDocument: {
            findFirst: vi.fn(async (): Promise<unknown> => null),
            findMany: vi.fn(async (): Promise<Array<{ id: string }>> => []),
            create: vi.fn(async () => ({})),
        },
        task: { create: vi.fn(async () => ({ id: "task-new" })) },
    };
    return {
        tx,
        invoice: { findUnique: vi.fn(async (): Promise<unknown> => ({ id: "inv-1", order: { cancelledAt: null } })) },
        enqueueTask: vi.fn(async () => {}),
        deleteDocument: vi.fn(async () => {}),
    };
});

vi.mock("@/core/prisma.js", () => ({
    prisma: {
        invoice: fake.invoice,
        $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(fake.tx)),
    },
}));
vi.mock("@/modules/documents/generation/enqueue-task.js", () => ({ enqueueTask: fake.enqueueTask }));
vi.mock("@/modules/documents/document.service.js", () => ({ deleteDocument: fake.deleteDocument }));

import { requestInvoiceGeneration } from "./invoice-generation.service.js";

describe("requestInvoiceGeneration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fake.tx.invoiceDocument.findFirst.mockResolvedValue(null);
        fake.tx.invoiceDocument.findMany.mockResolvedValue([]);
        fake.invoice.findUnique.mockResolvedValue({ id: "inv-1", order: { cancelledAt: null } });
    });

    it("creates task + pending document and enqueues it", async () => {
        const task = await requestInvoiceGeneration("inv-1");

        expect(task.id).toBe("task-new");
        expect(fake.tx.task.create).toHaveBeenCalledWith({
            data: { status: "PENDING", type: "GENERATION", target: "INVOICE" },
        });
        expect(fake.tx.invoiceDocument.create).toHaveBeenCalledWith({
            data: { invoiceId: "inv-1", status: "PENDING", taskId: "task-new" },
        });
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-new", { markFailedOnError: true });
        expect(fake.deleteDocument).not.toHaveBeenCalled();
    });

    it("replaces the previous document instead of versioning", async () => {
        fake.tx.invoiceDocument.findMany.mockResolvedValue([{ id: "doc-old" }]);

        await requestInvoiceGeneration("inv-1");

        expect(fake.deleteDocument).toHaveBeenCalledWith("invoice", "doc-old");
        expect(fake.tx.invoiceDocument.create).toHaveBeenCalledOnce();
    });

    it("re-uses a running generation and does not touch existing documents", async () => {
        fake.tx.invoiceDocument.findFirst.mockResolvedValue({ task: { id: "task-active" } });
        fake.tx.invoiceDocument.findMany.mockResolvedValue([{ id: "doc-old" }]);

        const task = await requestInvoiceGeneration("inv-1");

        expect(task.id).toBe("task-active");
        expect(fake.tx.task.create).not.toHaveBeenCalled();
        expect(fake.deleteDocument).not.toHaveBeenCalled();
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-active", { markFailedOnError: false });
    });

    it("refuses cancelled orders and unknown invoices", async () => {
        fake.invoice.findUnique.mockResolvedValue({ id: "inv-1", order: { cancelledAt: new Date() } });
        await expect(requestInvoiceGeneration("inv-1")).rejects.toMatchObject({ code: "ORDER_CANCELLED" });

        fake.invoice.findUnique.mockResolvedValue(null);
        await expect(requestInvoiceGeneration("nope")).rejects.toMatchObject({ statusCode: 404 });
        expect(fake.enqueueTask).not.toHaveBeenCalled();
    });
});
