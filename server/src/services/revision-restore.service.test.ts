import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  offerFindUnique: vi.fn(),
  offerRevisionFindFirst: vi.fn(),
  offerRevisionCreate: vi.fn(),
  offerUpdate: vi.fn(),
  offerPositionDeleteMany: vi.fn(),
  offerPositionCreateMany: vi.fn(),
  offerFlatRateDeleteMany: vi.fn(),
  offerFlatRateCreateMany: vi.fn(),
  offerDiscountDeleteMany: vi.fn(),
  offerDiscountCreateMany: vi.fn(),
  offerDocumentUpdateMany: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

import { restoreOfferRevision } from "./offer.service.js";

const current = {
  id: "offer-1",
  version: 3,
  supplierId: null,
  customerId: "customer-current",
  contactPersonId: "contact-1",
  userId: "user-1",
  language: "DE",
  quoteId: "AG-1",
  paymentTerm: "14 days",
  featureComparison: false,
  date: new Date("2026-07-03T00:00:00.000Z"),
  validUntil: null,
  requestFrom: null,
  net_amount: 2000,
  offerPositions: [{
    productId: "product-current",
    contractId: "contract-1",
    duration_months: 12,
    free_months: 0,
    quantity: 2,
    optional: false,
    eur_user_month: 100,
    total_cents: 2400,
    discount_cents: 400,
  }],
  offerFlatRates: [],
  offerDiscounts: [],
};

const restoredSnapshot = {
  offer: {
    supplierId: null,
    customerId: "customer-old",
    contactPersonId: "contact-old",
    userId: "user-1",
    language: "DE",
    quoteId: "AG-1",
    paymentTerm: "30 days",
    featureComparison: true,
    date: "2026-06-01T00:00:00.000Z",
    validUntil: null,
    requestFrom: null,
    net_amount: 900,
  },
  positions: [{
    productId: "product-old",
    contractId: "contract-old",
    duration_months: 12,
    free_months: 1,
    quantity: 1,
    optional: false,
    eur_user_month: 75,
    total_cents: 900,
    discount_cents: 75,
  }],
  flatRates: [],
  discounts: [],
};

describe("offer revision restore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (callback) => callback({
      $queryRaw: mocks.queryRaw,
      offer: { findUnique: mocks.offerFindUnique, update: mocks.offerUpdate },
      offerRevision: {
        findFirst: mocks.offerRevisionFindFirst,
        create: mocks.offerRevisionCreate,
      },
      offerPosition: {
        deleteMany: mocks.offerPositionDeleteMany,
        createMany: mocks.offerPositionCreateMany,
      },
      offerFlatRate: {
        deleteMany: mocks.offerFlatRateDeleteMany,
        createMany: mocks.offerFlatRateCreateMany,
      },
      offerDiscount: {
        deleteMany: mocks.offerDiscountDeleteMany,
        createMany: mocks.offerDiscountCreateMany,
      },
      offerDocument: { updateMany: mocks.offerDocumentUpdateMany },
    }));
    mocks.offerFindUnique.mockResolvedValue(current);
    mocks.offerRevisionFindFirst.mockResolvedValue({ snapshot: restoredSnapshot, snapshotVersion: 1 });
    mocks.offerUpdate.mockResolvedValue({ id: "offer-1", version: 4 });
  });

  it("archives current state, restores exact values, and invalidates the current document", async () => {
    await restoreOfferRevision("offer-1", "revision-1", 3, "actor-1");

    expect(mocks.offerRevisionFindFirst).toHaveBeenCalledWith({
      where: { id: "revision-1", offerId: "offer-1" },
      select: { snapshot: true, snapshotVersion: true },
    });
    expect(mocks.offerRevisionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ offerId: "offer-1", version: 3, changedById: "actor-1" }),
    });
    expect(mocks.offerUpdate).toHaveBeenCalledWith({
      where: { id: "offer-1" },
      data: expect.objectContaining({
        customerId: "customer-old",
        paymentTerm: "30 days",
        net_amount: 900,
        version: { increment: 1 },
      }),
    });
    expect(mocks.offerPositionCreateMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ productId: "product-old", total_cents: 900 })],
    });
    expect(mocks.offerDocumentUpdateMany).toHaveBeenCalledWith({
      where: { offerId: "offer-1", isCurrent: true },
      data: { isCurrent: false },
    });
  });

  it("rejects stale restore requests before writing a revision", async () => {
    await expect(restoreOfferRevision("offer-1", "revision-1", 2, "actor-1"))
      .rejects.toMatchObject({ statusCode: 409, code: "VERSION_CONFLICT" });
    expect(mocks.offerRevisionCreate).not.toHaveBeenCalled();
  });
});
