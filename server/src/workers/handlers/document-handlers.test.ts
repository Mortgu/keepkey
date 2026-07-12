import type { Task } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    generateOfferDocument: vi.fn(),
    generateOrderDocument: vi.fn(),
}));

vi.mock("../../services/document-generation.service.js", () => ({
    generateOfferDocument: mocks.generateOfferDocument,
    generateOrderDocument: mocks.generateOrderDocument,
}));

import offerTaskHandler from "./offer-handler.js";
import orderTaskHandler from "./order-handler.js";

const task = { id: "task-1" } as Task;

describe("document task handlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("delegiert Offer-Generierung an den vollständigen Use Case", async () => {
        await offerTaskHandler(task);

        expect(mocks.generateOfferDocument).toHaveBeenCalledWith("task-1");
    });

    it("delegiert Order-Generierung an den vollständigen Use Case", async () => {
        await orderTaskHandler(task);

        expect(mocks.generateOrderDocument).toHaveBeenCalledWith("task-1");
    });
});
