import { beforeEach, describe, expect, it, vi } from "vitest";

const offerDocumentFindUnique = vi.fn();
const orderDocumentFindUnique = vi.fn();
const confirmationDocumentFindUnique = vi.fn();
const invoiceDocumentFindUnique = vi.fn();

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offerDocument: { findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args) },
        orderDocument: { findUnique: (...args: unknown[]) => orderDocumentFindUnique(...args) },
        confirmationDocument: { findUnique: (...args: unknown[]) => confirmationDocumentFindUnique(...args) },
        invoiceDocument: { findUnique: (...args: unknown[]) => invoiceDocumentFindUnique(...args) },
    },
}));

const { documentTable } = await import("./document-repo.js");

describe('documentTable("offer").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the offer behind the document is accepted", async () => {
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: new Date() } });

        await expect(documentTable("offer").assertEditable("doc-1")).rejects.toMatchObject({
            code: "OFFER_ACCEPTED",
            statusCode: 409,
        });
    });

    it("passes for an unaccepted offer's document", async () => {
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: null } });

        await expect(documentTable("offer").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("order").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the order behind the document is cancelled", async () => {
        orderDocumentFindUnique.mockResolvedValue({ order: { cancelledAt: new Date() } });

        await expect(documentTable("order").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for a document of an uncancelled order", async () => {
        orderDocumentFindUnique.mockResolvedValue({ order: { cancelledAt: null } });

        await expect(documentTable("order").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("confirmation").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the confirmation's order is cancelled", async () => {
        confirmationDocumentFindUnique.mockResolvedValue({ confirmation: { order: { cancelledAt: new Date() } } });

        await expect(documentTable("confirmation").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for a confirmation of an uncancelled order", async () => {
        confirmationDocumentFindUnique.mockResolvedValue({ confirmation: { order: { cancelledAt: null } } });

        await expect(documentTable("confirmation").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("invoice").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the invoice's order is cancelled", async () => {
        invoiceDocumentFindUnique.mockResolvedValue({ invoice: { order: { cancelledAt: new Date() } } });

        await expect(documentTable("invoice").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for an invoice of an uncancelled order", async () => {
        invoiceDocumentFindUnique.mockResolvedValue({ invoice: { order: { cancelledAt: null } } });

        await expect(documentTable("invoice").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("offer").canAdopt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const current = (overrides: Record<string, unknown> = {}) => ({
        isCurrent: true,
        sourceVersion: 4,
        offer: { version: 4, acceptedAt: null },
        ...overrides,
    });

    it("is true for the current document of an unchanged, unaccepted offer", async () => {
        offerDocumentFindUnique.mockResolvedValue(current());

        expect(await documentTable("offer").canAdopt("doc-1")).toBe(true);
    });

    it("is false once the offer has moved past the document's source version", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ offer: { version: 5, acceptedAt: null } }));

        expect(await documentTable("offer").canAdopt("doc-1")).toBe(false);
    });

    it("is false for a document that is no longer the current one", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ isCurrent: false }));

        expect(await documentTable("offer").canAdopt("doc-1")).toBe(false);
    });

    it("is false once the offer is accepted", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ offer: { version: 4, acceptedAt: new Date() } }));

        expect(await documentTable("offer").canAdopt("doc-1")).toBe(false);
    });
});

describe("documentTable(type).canAdopt for other document types", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("is false — never even queries", async () => {
        expect(await documentTable("invoice").canAdopt("doc-1")).toBe(false);
        expect(invoiceDocumentFindUnique).not.toHaveBeenCalled();
    });
});
