import { beforeEach, describe, expect, it, vi } from "vitest";

const offerDocumentFindFirst = vi.fn();
const offerDocumentFindUnique = vi.fn();

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offerDocument: {
            findFirst: (...args: unknown[]) => offerDocumentFindFirst(...args),
            findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args),
        },
    },
}));

const { renameDocument, deleteDocument, createReplacementUpload } = await import("./documents.service.js");

describe("offer document mutations once the offer is accepted", () => {
    beforeEach(() => {
        offerDocumentFindFirst.mockResolvedValue({ id: "doc-1", status: "GENERATED", artifacts: [] });
        offerDocumentFindUnique.mockResolvedValue({ offer: { acceptedAt: new Date() } });
    });

    it("renameDocument is rejected", async () => {
        await expect(
            renameDocument("offer", "doc-1", { displayName: "Neuer Name" }),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });

    it("deleteDocument is rejected", async () => {
        await expect(
            deleteDocument("offer", "doc-1"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });

    it("createReplacementUpload is rejected", async () => {
        await expect(
            createReplacementUpload("offer", "doc-1", "docx"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });
});
