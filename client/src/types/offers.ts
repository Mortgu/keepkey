import type { components } from "./api";

export interface OfferFilters {
    search?: string;
    companyIds?: Array<string>;
    contactPersonIds?: Array<string>;
    sort?: string;
    cursor?: string;
    limit?: number;
}

export interface OffersPage {
    items: Array<Offer>;
    nextCursor: string | null;
}

export type Offer = components["schemas"]["Offer"];
export type OfferPosition = components["schemas"]["OfferPosition"];
export type OfferFlatRate = components["schemas"]["OfferFlatRate"];
export type OfferRevision = {
    id: string;
    version: number;
    createdAt: string;
    changedBy: { id: string; name: string };
};
export type OfferDocument = components["schemas"]["OfferDocument"];

export type CreateOfferInput = Pick<Offer,
    "customerId" |
    "contactPersonId" |
    "language" |
    "quoteId" |
    "paymentTerm" |
    "validUntil" |
    "requestFrom" |
    "userId" |
    "supplierId" |
    "featureComparison"
>;

export type UpdateOfferInput = Partial<CreateOfferInput>;

export type CreateOfferPositionInput = Pick<OfferPosition,
    "contractId" |
    "duration_months" |
    "free_months" |
    "productId" |
    "quantity" |
    "optional"
>;

export type UpdateOfferPositionInput = Partial<CreateOfferPositionInput>;

export type GetOfferFlatrate = Omit<OfferFlatRate, "id" | "offer">;

export type CreateOfferFlatrateInput = Pick<OfferFlatRate,
    "flatRateId" |
    "quantity"
>;

export type UpdateOfferFlatrateInput = Partial<CreateOfferFlatrateInput>;
