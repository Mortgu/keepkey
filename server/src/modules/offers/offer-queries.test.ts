import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn(async () => []));
vi.mock("@/core/prisma.js", () => ({ prisma: { offer: { findMany } } }));

import { getOffers } from "./services/get-offer.service.js";

const whereOf = () => (findMany.mock.calls[0] as unknown as [{ where?: unknown }])[0].where;

describe("getOffers filters", () => {
    beforeEach(() => findMany.mockClear());

    it("searches offer number, company and contact person case-insensitively", async () => {
        await getOffers({ search: "  Brandt " });
        const contains = { contains: "Brandt", mode: "insensitive" };
        expect(whereOf()).toEqual({
            OR: [
                { quoteId: contains },
                { customer: { companyName: contains } },
                { customerContactPerson: { firstName: contains } },
                { customerContactPerson: { lastName: contains } },
            ],
        });
    });

    it("limits to open offers with status=open", async () => {
        await getOffers({ status: "open" });
        expect(whereOf()).toEqual({ acceptedAt: null });
    });

    it("sends no where clause without filters", async () => {
        await getOffers({});
        expect(whereOf()).toBeUndefined();
    });
});
