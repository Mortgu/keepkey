import { describe, expect, it } from "vitest";
import {
  buildOfferRevisionSnapshot,
  buildOrderRevisionSnapshot,
  parseOfferRevisionSnapshot,
  parseOrderRevisionSnapshot,
} from "./revision-schemas.js";

const offer = {
  supplierId: null,
  customerId: "customer-1",
  contactPersonId: "contact-1",
  userId: "user-1",
  language: "DE",
  quoteId: "AG-1",
  paymentTerm: "14 days",
  featureComparison: false,
  date: new Date("2026-07-01T00:00:00.000Z"),
  validUntil: null,
  requestFrom: new Date("2026-06-30T00:00:00.000Z"),
  net_amount: 1200,
  offerPositions: [{
    productId: "product-1",
    contractId: "contract-1",
    duration_months: 12,
    free_months: 1,
    quantity: 2,
    optional: false,
    eur_user_month: 50,
    total_cents: 1200,
    discount_cents: 100,
  }],
  offerFlatRates: [{ flatRateId: "flat-rate-1", quantity: 1, total_cents: 100 }],
};

const order = {
  supplierId: null,
  customerId: "customer-1",
  contactPersonId: "contact-1",
  employeeId: "user-1",
  orderId: "BE-1",
  paymentTerm: "14 days",
  projectNumber: null,
  projectDescription: "Project",
  orderDetails: null,
  date: new Date("2026-07-01T00:00:00.000Z"),
  validUntil: null,
  requestFrom: null,
  net_amount: 1200,
  orderPositions: [{
    productId: "product-1",
    contractId: "contract-1",
    duration_months: 12,
    quantity: 2,
    optional: false,
    total_cents: 1200,
  }],
  flatRates: [{ flatRateId: "flat-rate-1", quantity: 1, total_cents: 100 }],
};

describe("revision snapshot schemas", () => {
  it("creates a stable offer snapshot and reads the legacy root shape", () => {
    const snapshot = buildOfferRevisionSnapshot(offer);

    expect(snapshot.offer.date).toBe("2026-07-01T00:00:00.000Z");
    expect(snapshot.positions[0]?.discount_cents).toBe(100);
    expect(parseOfferRevisionSnapshot(offer)).toEqual(snapshot);
  });

  it("normalizes snapshots created before offer pricing fields existed", () => {
    const legacy = {
      ...offer,
      offerPositions: offer.offerPositions.map((position) => ({
        productId: position.productId,
        contractId: position.contractId,
        duration_months: position.duration_months,
        quantity: position.quantity,
        optional: position.optional,
        total_cents: position.total_cents,
      })),
    };
    delete (legacy as Partial<typeof offer>).featureComparison;

    const snapshot = parseOfferRevisionSnapshot(legacy);

    expect(snapshot.offer.featureComparison).toBe(false);
    expect(snapshot.positions[0]).toMatchObject({
      free_months: 0,
      eur_user_month: 50,
      discount_cents: 0,
    });
  });

  it("preserves stored order monetary values", () => {
    const snapshot = buildOrderRevisionSnapshot(order);

    expect(parseOrderRevisionSnapshot(snapshot)).toEqual(snapshot);
    expect(snapshot.order.net_amount).toBe(1200);
    expect(snapshot.positions[0]?.total_cents).toBe(1200);
  });

  it("rejects snapshots that cannot reproduce the aggregate", () => {
    expect(() => parseOfferRevisionSnapshot({ offer: {}, positions: [], flatRates: [] })).toThrow();
    expect(() => parseOrderRevisionSnapshot({ order: {}, positions: [], flatRates: [] })).toThrow();
  });
});
