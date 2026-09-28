import { afterEach, describe, expect, it, vi } from "vitest";
import { createOrderSchema, updateOrderSchema } from "@keepit/schemas";
import { cancelOrder, createOrder, updateOrder } from "./order-api";

const acceptance = { id: "a598e5c1-af68-428c-a398-f4022a9fe246", expectedOfferVersion: 7, orderId: "23232", projectNumber: "232323" };
afterEach(() => vi.unstubAllGlobals());

function mockResponse(status = 200, body: unknown = {}) {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("order write contracts", () => {
    it("sends the selected offer version and additional metadata", async () => {
        const fetchMock = mockResponse();
        await createOrder(acceptance);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toMatch(/\/api\/orders$/);
        expect(options.method).toBe("POST");
        expect(options.credentials).toBe("include");
        expect(createOrderSchema.parse(JSON.parse(options.body))).toEqual(acceptance);
    });

    it("rejects the old request without an offer version and copied commercial data", () => {
        const oldRequest = { id: acceptance.id, orderId: acceptance.orderId, projectNumber: acceptance.projectNumber };
        expect(createOrderSchema.safeParse(oldRequest).success).toBe(false);
        expect(createOrderSchema.safeParse({ ...acceptance, net_amount: 100 }).success).toBe(false);
    });

    it("updates only order metadata with optimistic concurrency", async () => {
        const fetchMock = mockResponse();
        const input = { expectedVersion: 3, order: { orderId: "23232", date: "2026-09-08", projectNumber: null, projectDescription: "Updated", orderDetails: null } };
        await updateOrder("order-id", input);
        const [, options] = fetchMock.mock.calls[0];
        expect(options.method).toBe("PATCH");
        expect(updateOrderSchema.parse(JSON.parse(options.body))).toEqual(input);
        expect(updateOrderSchema.safeParse({ ...input, order: { ...input.order, net_amount: 1 } }).success).toBe(false);
    });

    it("cancels with a version instead of deleting", async () => {
        const fetchMock = mockResponse();
        await cancelOrder("order-id", 4);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toMatch(/\/api\/orders\/order-id\/cancel$/);
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ expectedVersion: 4 });
    });

    it("preserves the conflict code for the form error instead of reporting success", async () => {
        mockResponse(409, { success: false, code: "VERSION_CONFLICT", message: "Changed" });
        await expect(createOrder(acceptance)).rejects.toMatchObject({ status: 409, code: "VERSION_CONFLICT" });
    });
});
