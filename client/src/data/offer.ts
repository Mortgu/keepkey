import { api } from "@/lib/api-client";

import type {
  Offer,
  CreateOfferInput,
  CreateOfferPositionInput,
  CreateOfferFlatRatesInput
} from '@/types';

export const getOffersAction = () =>
  api<Offer[]>("/api/offers", { method: "GET" });

export const createOfferAction = (
  offer: CreateOfferInput,
  positions: CreateOfferPositionInput[],
  flatRates: CreateOfferFlatRatesInput[],
) =>
  api<Offer>("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, positions, flatRates }),
  });

export const deleteOfferAction = (id: string) =>
  api<void>(`/api/offers/${id}`, { method: "DELETE" });
