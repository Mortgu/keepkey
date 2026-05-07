import type { components } from "./api";

export type Offer = components["schemas"]["Offer"];
export type OfferTask = Offer["tasks"];
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
  | "documents"
  | "tasks"
  | "net_amount"
>;
export type UpdateOfferInput = Partial<Offer>;

export type CreateOfferPositionInput = Omit<
  OfferPosition,
  "id" | "createdAt" | "updatedAt" | "offer" | "product" | "contract"
>;
export type UpdateOfferPositionInput = Partial<CreateOfferPositionInput>;

export type CreateOfferFlatRatesInput = Omit<OfferFlatRate,
  "id" | "offer">;

export type UpdateOfferFlatRatesInput = Partial<CreateOfferFlatRatesInput>;
