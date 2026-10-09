import type { Prisma } from "@prisma/client";
import { parseAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";

/**
 * Overlay frozen business fields while keeping live document/task metadata.
 *
 * `orders` ist der (irreführend plural benannte) 1:1-Relationsname aus Prisma
 * (siehe `offer.prisma`) — nach außen heißt das Feld `order`, wie im Shared-Schema.
 */
export function presentOffer<
    T extends { id: string; acceptedSnapshot: Prisma.JsonValue | null; orders?: unknown },
>(offer: T) {
    const { acceptedSnapshot, orders, ...publicOffer } = offer;
    const withOrder = { ...publicOffer, ...(orders !== undefined ? { order: orders } : {}) };
    if (!acceptedSnapshot) return withOrder;
    const s = parseAcceptedOfferSnapshot(acceptedSnapshot);
    return {
        ...withOrder,
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
