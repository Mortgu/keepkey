import { describe, expect, it } from "vitest";
import { OFFER_MODAL_POLICIES, resolveOfferModalPolicy } from "./offer-modal-policy";

describe("resolveOfferModalPolicy", () => {
    it("keeps the table entry when a source offer exists", () => {
        expect(resolveOfferModalPolicy("renewal", true)).toBe(OFFER_MODAL_POLICIES.renewal);
        expect(resolveOfferModalPolicy("extension", true)).toBe(OFFER_MODAL_POLICIES.extension);
    });

    it("never derives a standalone variant for plain offers", () => {
        expect(resolveOfferModalPolicy("offer", false)).toBe(OFFER_MODAL_POLICIES.offer);
    });

    it("opens header and product for a renewal without source and prices live", () => {
        const policy = resolveOfferModalPolicy("renewal", false);

        expect(policy.header.customerId).toBe("edit");
        expect(policy.header.contractId).toBe("edit");
        expect(policy.positions.fields.productId).toBe("edit");
        expect(policy.positions.startEmpty).toBe(true);
        expect(policy.flatrates.canAdd).toBe(true);
        expect(policy.priceSource).toBe("live");
        expect(policy.resetQuoteId).toBe(true);
    });

    it("keeps what defines an extension: no flatrates, no comparison, live price without pin", () => {
        const policy = resolveOfferModalPolicy("extension", false);

        expect(policy.header.duration_months).toBe("edit");
        expect(policy.flatrates.access).toBe("hidden");
        expect(policy.featureComparison).toBe("hidden");
        expect(policy.priceSource).toBe("live");
    });
});
