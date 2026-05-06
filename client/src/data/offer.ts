import { api } from "@/lib/api-client";

import type {
  Offer,
  CreateOfferInput,
  UpdateOfferInput,
  CreateOfferPositionInput,
  CreateOfferFlatRatesInput,
  UpdateOfferFlatRatesInput,
  UpdateOfferPositionInput,
} from '@/types';

export const getOffersAction = () =>
  api<Offer[]>("/api/offers", { method: "GET" });

export const createOfferAction = (offer: CreateOfferInput, positions: CreateOfferPositionInput[], flatRates: CreateOfferFlatRatesInput[]) =>
  api<Offer>("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, positions, flatRates }),
  });

export const deleteOfferAction = (id: string) =>
  api<void>(`/api/offers/${id}`, { method: "DELETE" });

export const updateOfferAction = (
  id: string, offer: UpdateOfferInput, positions: UpdateOfferPositionInput[], flatRates: UpdateOfferFlatRatesInput[],
) => api<Offer>(`/api/offers/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ offer, positions, flatRates }),
});