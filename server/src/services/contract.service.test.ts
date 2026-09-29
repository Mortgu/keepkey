import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = vi.hoisted(() => ({
    contract: {
        findMany: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
    },
}));

import { reorderContracts } from "./contract.service.js";

describe("reorderContracts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        tx.contract.findMany.mockResolvedValue([{ id: "a" }, { id: "b" }, { id: "c" }]);
    });

    it("writes the index of each id as sortOrder", async () => {
        await reorderContracts(["c", "a", "b"]);

        expect(tx.contract.update.mock.calls.map(([args]) => [args.where.id, args.data.sortOrder])).toEqual([
            ["c", 0],
            ["a", 1],
            ["b", 2],
        ]);
    });

    it.each([
        ["a contract is missing", ["a", "b"]],
        ["an unknown contract is included", ["a", "b", "x"]],
        ["an id is duplicated", ["a", "b", "b"]],
        ["an extra id is appended", ["a", "b", "c", "d"]],
    ])("rejects a stale list when %s", async (_, ids) => {
        await expect(reorderContracts(ids)).rejects.toMatchObject({
            statusCode: 409,
            code: "CONTRACT_ORDER_STALE",
        });
        expect(tx.contract.update).not.toHaveBeenCalled();
    });
});
