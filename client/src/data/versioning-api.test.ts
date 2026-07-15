import { beforeEach, describe, expect, it, vi } from "vitest";

import { restoreOfferRevision } from "../hooks/offers/offer-api";
import { restoreOrderRevisionAction } from "./orders";

const api = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-client", () => ({ api }));

describe("version restore API contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("restores an offer revision with optimistic concurrency", async () => {
    await restoreOfferRevision("offer-1", "revision-2", 4);

    expect(api).toHaveBeenCalledWith(
      "/api/offers/offer-1/revisions/revision-2/restore",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion: 4 }),
      },
    );
  });

  it("restores an order revision with optimistic concurrency", async () => {
    await restoreOrderRevisionAction("order-1", "revision-3", 6);

    expect(api).toHaveBeenCalledWith(
      "/api/orders/order-1/revisions/revision-3/restore",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion: 6 }),
      },
    );
  });
});
