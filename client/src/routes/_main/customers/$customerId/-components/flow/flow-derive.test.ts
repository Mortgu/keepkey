import { describe, expect, it } from "vitest";
import { deriveStages } from "./flow-derive";
import type { Offer } from "@keepit/schemas";

function offerWithOrder(order: unknown): Offer {
    return {
        quoteNumber: "1001",
        date: "2026-01-01",
        offerDocuments: [],
        order,
    } as unknown as Offer;
}

describe("deriveStages — confirmation/invoice suppression on cancellation", () => {
    it("reads confirmation and invoice as cancelled (suppressed) when the order is cancelled and neither was ever created", () => {
        const offer = offerWithOrder({
            orderId: "2001",
            date: "2026-02-01",
            documents: [],
            cancelledAt: "2026-03-01",
            confirmation: null,
            invoice: null,
        });

        const [, , confirmationStage, invoiceStage] = deriveStages(offer);

        expect(confirmationStage.state).toBe("cancelled");
        expect(invoiceStage.state).toBe("cancelled");
    });

    it("keeps showing historical content (not suppressed) when a confirmation/invoice was created before cancellation", () => {
        const offer = offerWithOrder({
            orderId: "2002",
            date: "2026-02-01",
            documents: [],
            cancelledAt: "2026-03-01",
            confirmation: { confirmationId: "3001", date: "2026-02-15", documents: [] },
            invoice: { invoiceId: "4001", date: "2026-02-20", documents: [] },
        });

        const [, , confirmationStage, invoiceStage] = deriveStages(offer);

        expect(confirmationStage.state).not.toBe("cancelled");
        expect(confirmationStage.state).toBe("done");
        expect(confirmationStage.number).toBe("AB3001");

        expect(invoiceStage.state).not.toBe("cancelled");
        expect(invoiceStage.state).toBe("done");
        expect(invoiceStage.number).toBe("RE4001");
    });

    it("is unaffected by confirmation/invoice presence when the order is not cancelled (regression guard)", () => {
        const notCancelledNeverCreated = offerWithOrder({
            orderId: "2003",
            date: "2026-02-01",
            documents: [],
            cancelledAt: null,
            confirmation: null,
            invoice: null,
        });
        const [, , confirmationStage1, invoiceStage1] = deriveStages(notCancelledNeverCreated);
        expect(confirmationStage1.state).toBe("action");
        expect(invoiceStage1.state).toBe("action");

        const notCancelledCreated = offerWithOrder({
            orderId: "2004",
            date: "2026-02-01",
            documents: [],
            cancelledAt: null,
            confirmation: { confirmationId: "3002", date: "2026-02-15", documents: [] },
            invoice: { invoiceId: "4002", date: "2026-02-20", documents: [] },
        });
        const [, , confirmationStage2, invoiceStage2] = deriveStages(notCancelledCreated);
        expect(confirmationStage2.state).toBe("done");
        expect(invoiceStage2.state).toBe("done");
    });

    it("locks confirmation and invoice entirely when there is no order at all", () => {
        const offer = offerWithOrder(null);
        const [, , confirmationStage, invoiceStage] = deriveStages(offer);
        expect(confirmationStage.state).toBe("locked");
        expect(invoiceStage.state).toBe("locked");
    });
});
