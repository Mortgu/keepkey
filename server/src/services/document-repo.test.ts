import { beforeEach, describe, expect, it, vi } from "vitest";

// Alle Dokumenttypen liegen in einer Tabelle — ein einziger Delegate, gefiltert über `type`.
const documentFindFirst = vi.fn();

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        document: { findFirst: (...args: unknown[]) => documentFindFirst(...args) },
    },
}));

const { documentTable } = await import("./document-repo.js");

describe('documentTable("offer").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the offer behind the document is accepted", async () => {
        documentFindFirst.mockResolvedValue({ offer: { acceptedAt: new Date() } });

        await expect(documentTable("offer").assertEditable("doc-1")).rejects.toMatchObject({
            code: "OFFER_ACCEPTED",
            statusCode: 409,
        });
    });

    it("passes for an unaccepted offer's document", async () => {
        documentFindFirst.mockResolvedValue({ offer: { acceptedAt: null } });

        await expect(documentTable("offer").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("order").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the order behind the document is cancelled", async () => {
        documentFindFirst.mockResolvedValue({ order: { cancelledAt: new Date() } });

        await expect(documentTable("order").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for a document of an uncancelled order", async () => {
        documentFindFirst.mockResolvedValue({ order: { cancelledAt: null } });

        await expect(documentTable("order").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("confirmation").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the confirmation's order is cancelled", async () => {
        documentFindFirst.mockResolvedValue({ confirmation: { order: { cancelledAt: new Date() } } });

        await expect(documentTable("confirmation").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for a confirmation of an uncancelled order", async () => {
        documentFindFirst.mockResolvedValue({ confirmation: { order: { cancelledAt: null } } });

        await expect(documentTable("confirmation").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});

describe('documentTable("invoice").assertEditable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the invoice's order is cancelled", async () => {
        documentFindFirst.mockResolvedValue({ invoice: { order: { cancelledAt: new Date() } } });

        await expect(documentTable("invoice").assertEditable("doc-1")).rejects.toMatchObject({
            code: "ORDER_CANCELLED",
            statusCode: 409,
        });
    });

    it("passes for an invoice of an uncancelled order", async () => {
        documentFindFirst.mockResolvedValue({ invoice: { order: { cancelledAt: null } } });

        await expect(documentTable("invoice").assertEditable("doc-1")).resolves.toBeUndefined();
    });
});


describe("documentTable(type) on the shared document table", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        documentFindFirst.mockResolvedValue(null);
    });

    it.each([
        ["offer", "OFFER"],
        ["order", "ORDER"],
        ["confirmation", "CONFIRMATION"],
        ["invoice", "INVOICE"],
    ] as const)("scopes %s lookups to type %s, so another type's id is never found", async (type, ownerType) => {
        await documentTable(type).findWithArtifacts("doc-1");

        expect(documentFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: expect.objectContaining({ id: "doc-1", type: ownerType }) }),
        );
    });
});
