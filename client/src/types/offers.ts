import type { components } from "./api";

export type Offer = components["schemas"]["Offer"];
export type OfferPosition = components["schemas"]["OfferPosition"];
export type OfferFlatRate = components["schemas"]["OfferFlatRate"];

export type CreateOfferInput = Omit<
    Offer,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "supplier"
    | "customer"
    | "customerContactPerson"
    | "user"
    | "offerFlatRates"
    | "offerPositions"
    | "order"
    | "documentJobs"
    | "documents"
    | "tasks"
>;
export type UpdateOfferInput = Partial<CreateOfferInput>;

export type CreateOfferPositionInput = Omit<
    OfferPosition,
    "id" | "createdAt" | "updatedAt" | "offer" | "product" | "contract"
>;
export type UpdateOfferPositionInput = Partial<CreateOfferPositionInput>;

export type CreateOfferFlatRatesInput = Omit<OfferFlatRate, "id" | "flatRate" | "offer">;
export type UpdateOfferFlatRatesInput = Partial<CreateOfferFlatRatesInput>;
