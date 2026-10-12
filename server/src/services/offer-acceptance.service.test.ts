import { beforeEach, describe, expect, it, vi } from "vitest";

const offerDocumentFindUnique = vi.fn();

vi.mock("../lib/prismaClient.js", () => ({
    prisma: { offerDocument: { findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args) } },
}));

const { assertOfferDocumentEditable, canAdoptIntoSource } = await import("./offer-acceptance.service.js");

describe("assertOfferDocumentEditable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects once the offer behind the document is accepted", async () => {
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: new Date() } });

        await expect(assertOfferDocumentEditable("offer", "doc-1")).rejects.toMatchObject({
            code: "OFFER_ACCEPTED",
            statusCode: 409,
        });
    });

    it("passes for an unaccepted offer's document", async () => {
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: null } });

        await expect(assertOfferDocumentEditable("offer", "doc-1")).resolves.toBeUndefined();
    });

    it("knows nothing about other document types — never even queries", async () => {
        await expect(assertOfferDocumentEditable("confirmation", "doc-1")).resolves.toBeUndefined();
        expect(offerDocumentFindUnique).not.toHaveBeenCalled();
    });
});

describe("canAdoptIntoSource", () => {
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

        expect(await canAdoptIntoSource("offer", "doc-1")).toBe(true);
    });

    it("is false once the offer has moved past the document's source version", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ offer: { version: 5, acceptedAt: null } }));

        expect(await canAdoptIntoSource("offer", "doc-1")).toBe(false);
    });

    it("is false for a document that is no longer the current one", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ isCurrent: false }));

        expect(await canAdoptIntoSource("offer", "doc-1")).toBe(false);
    });

    it("is false once the offer is accepted", async () => {
        offerDocumentFindUnique.mockResolvedValue(current({ offer: { version: 4, acceptedAt: new Date() } }));

        expect(await canAdoptIntoSource("offer", "doc-1")).toBe(false);
    });

    it("is false for other document types — never even queries", async () => {
        expect(await canAdoptIntoSource("invoice", "doc-1")).toBe(false);
        expect(offerDocumentFindUnique).not.toHaveBeenCalled();
    });
});
