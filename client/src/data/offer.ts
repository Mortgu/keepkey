import type { OfferProductInput } from "@/routes/_main/offers/-components/offer-product-form";
import type { BaseFlatRate, BaseOffer, Offer } from "./types";
import { api } from "@/lib/api-client";

export const getOffersAction = () =>
  api<Offer[]>("/api/offers", { method: "GET" });

export const createOfferAction = (
  offer: BaseOffer,
  positions: OfferProductInput[],
  flatRates: BaseFlatRate[],
) =>
  api<Offer>("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, positions, flatRates }),
  });

export const deleteOfferAction = (id: string) =>
  api<void>(`/api/offers/${id}`, { method: "DELETE" });
