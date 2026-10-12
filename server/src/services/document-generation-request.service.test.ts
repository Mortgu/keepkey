import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
    const tx = {
        $queryRaw: vi.fn(async () => []),
        offer: { findUniqueOrThrow: vi.fn(), update: vi.fn(async () => ({ documentVersion: 1 })) },
        order: { findUniqueOrThrow: vi.fn(), update: vi.fn(async () => ({ documentVersion: 1 })) },
        confirmation: { findUnique: vi.fn(), update: vi.fn(async () => ({ documentVersion: 1 })) },
        invoice: { findUnique: vi.fn(), update: vi.fn(async () => ({ documentVersion: 1 })) },
        offerDocument: { findFirst: vi.fn(async (): Promise<unknown> => null), create: vi.fn(async () => ({})) },
        orderDocument: { findFirst: vi.fn(async (): Promise<unknown> => null), create: vi.fn(async () => ({})) },
        confirmationDocument: { findFirst: vi.fn(async (): Promise<unknown> => null), create: vi.fn(async () => ({})) },
        invoiceDocument: { findFirst: vi.fn(async (): Promise<unknown> => null), create: vi.fn(async () => ({})) },
        task: { create: vi.fn(async () => ({ id: "task-new" })) },
    };
    return {
        tx,
        transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
        enqueueTask: vi.fn(async () => {}),
    };
});

vi.mock("../lib/prismaClient.js", () => ({ prisma: { $transaction: fake.transaction } }));
vi.mock("../lib/document.js", () => ({ enqueueTask: fake.enqueueTask }));

const {
    requestOfferGeneration,
    requestOrderGeneration,
    requestConfirmationGeneration,
    requestInvoiceGeneration,
} = await import("./document-generation-request.service.js");

beforeEach(() => {
    vi.clearAllMocks();
    fake.tx.offer.findUniqueOrThrow.mockResolvedValue({ version: 1, acceptedAt: null });
    fake.tx.order.findUniqueOrThrow.mockResolvedValue({ version: 1, cancelledAt: null });
    fake.tx.confirmation.findUnique.mockResolvedValue({ order: { cancelledAt: null } });
    fake.tx.invoice.findUnique.mockResolvedValue({ order: { cancelledAt: null } });
});

describe("requestOfferGeneration", () => {
    it("rejects with OFFER_ACCEPTED once the offer has been accepted", async () => {
        fake.tx.offer.findUniqueOrThrow.mockResolvedValueOnce({ version: 3, acceptedAt: new Date() });

        await expect(
            requestOfferGeneration("offer-1", () => "Angebot v1"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });

    it("creates a new version and enqueues it", async () => {
        const task = await requestOfferGeneration("offer-1", (v) => `Angebot v${v}`);

        expect(task.id).toBe("task-new");
        expect(fake.tx.offerDocument.create).toHaveBeenCalledWith({
            data: { displayName: "Angebot v1", offerId: "offer-1", version: 1, sourceVersion: 1, isCurrent: false, status: "PENDING", taskId: "task-new" },
        });
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-new", { markFailedOnError: true });
    });
});

describe("requestOrderGeneration", () => {
    it("rejects cancelled orders", async () => {
        fake.tx.order.findUniqueOrThrow.mockResolvedValueOnce({ version: 1, cancelledAt: new Date() });

        await expect(requestOrderGeneration("order-1")).rejects.toMatchObject({ code: "ORDER_CANCELLED" });
    });

    it("re-uses a running generation instead of creating a new version", async () => {
        fake.tx.orderDocument.findFirst.mockResolvedValue({ task: { id: "task-active" } });

        const task = await requestOrderGeneration("order-1");

        expect(task.id).toBe("task-active");
        expect(fake.tx.task.create).not.toHaveBeenCalled();
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-active", { markFailedOnError: false });
    });
});

describe("requestConfirmationGeneration", () => {
    it("creates a new version with sourceVersion null and never deletes anything", async () => {
        const task = await requestConfirmationGeneration("conf-1");

        expect(task.id).toBe("task-new");
        expect(fake.tx.confirmationDocument.create).toHaveBeenCalledWith({
            data: { confirmationId: "conf-1", version: 1, sourceVersion: null, isCurrent: false, status: "PENDING", taskId: "task-new" },
        });
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-new", { markFailedOnError: true });
    });

    it("re-uses a running generation instead of creating a new version", async () => {
        fake.tx.confirmationDocument.findFirst.mockResolvedValue({ task: { id: "task-active" } });

        const task = await requestConfirmationGeneration("conf-1");

        expect(task.id).toBe("task-active");
        expect(fake.tx.task.create).not.toHaveBeenCalled();
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-active", { markFailedOnError: false });
    });

    it("refuses cancelled orders and unknown confirmations", async () => {
        fake.tx.confirmation.findUnique.mockResolvedValue({ order: { cancelledAt: new Date() } });
        await expect(requestConfirmationGeneration("conf-1")).rejects.toMatchObject({ code: "ORDER_CANCELLED" });

        fake.tx.confirmation.findUnique.mockResolvedValue(null);
        await expect(requestConfirmationGeneration("nope")).rejects.toMatchObject({ statusCode: 404 });
        expect(fake.enqueueTask).not.toHaveBeenCalled();
    });
});

describe("requestInvoiceGeneration", () => {
    it("creates a new version with sourceVersion null and never deletes anything", async () => {
        const task = await requestInvoiceGeneration("inv-1");

        expect(task.id).toBe("task-new");
        expect(fake.tx.invoiceDocument.create).toHaveBeenCalledWith({
            data: { invoiceId: "inv-1", version: 1, sourceVersion: null, isCurrent: false, status: "PENDING", taskId: "task-new" },
        });
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-new", { markFailedOnError: true });
    });

    it("re-uses a running generation instead of creating a new version", async () => {
        fake.tx.invoiceDocument.findFirst.mockResolvedValue({ task: { id: "task-active" } });

        const task = await requestInvoiceGeneration("inv-1");

        expect(task.id).toBe("task-active");
        expect(fake.tx.task.create).not.toHaveBeenCalled();
        expect(fake.enqueueTask).toHaveBeenCalledWith("task-active", { markFailedOnError: false });
    });

    it("refuses cancelled orders and unknown invoices", async () => {
        fake.tx.invoice.findUnique.mockResolvedValue({ order: { cancelledAt: new Date() } });
        await expect(requestInvoiceGeneration("inv-1")).rejects.toMatchObject({ code: "ORDER_CANCELLED" });

        fake.tx.invoice.findUnique.mockResolvedValue(null);
        await expect(requestInvoiceGeneration("nope")).rejects.toMatchObject({ statusCode: 404 });
        expect(fake.enqueueTask).not.toHaveBeenCalled();
    });
});
