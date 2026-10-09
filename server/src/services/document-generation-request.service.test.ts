import { describe, expect, it, vi } from "vitest";

const findUniqueOrThrow = vi.fn();

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        $transaction: (fn: (tx: unknown) => unknown) => fn({
            $queryRaw: async () => undefined,
            offer: { findUniqueOrThrow },
        }),
    },
}));

const { requestOfferGeneration } = await import("./document-generation-request.service.js");

describe("requestOfferGeneration", () => {
    it("rejects with OFFER_ACCEPTED once the offer has been accepted", async () => {
        findUniqueOrThrow.mockResolvedValueOnce({ version: 3, acceptedAt: new Date() });

        await expect(
            requestOfferGeneration("offer-1", () => "Angebot v1"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });
});
