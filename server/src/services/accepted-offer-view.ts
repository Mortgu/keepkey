import type { Prisma } from "@prisma/client";
import { parseAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";

/** Overlay frozen business fields while keeping live document/task metadata. */
export function presentOffer<
    T extends { id: string; acceptedSnapshot: Prisma.JsonValue | null },
>(offer: T) {
    const { acceptedSnapshot, ...publicOffer } = offer;
    if (!acceptedSnapshot) return publicOffer;
    const s = parseAcceptedOfferSnapshot(acceptedSnapshot);
    return {
        ...publicOffer,
        customerId: s.customerId,
        contactPersonId: s.contactPersonId,
        supplierId: s.supplierId,
        userId: s.employeeId,
        user: s.employee,
        customer: s.customer,
        customerContactPerson: s.customerContactPerson,
        contractId: s.contractId,
        contract: s.contract,
        duration_months: s.duration_months,
        paymentTerm: s.paymentTerm,
        language: s.language,
        validUntil: s.validUntil,
        requestFrom: s.requestFrom,
        net_amount: s.net_amount,
        offerPositions: s.positions.map((p) => ({ ...p, offerId: offer.id })),
        offerFlatRates: s.flatRates.map((p) => ({ ...p, offerId: offer.id })),
        offerDiscounts: s.discounts.map((d) => ({ ...d, offerId: offer.id })),
    };
}
