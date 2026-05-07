import { api } from "@/lib/api-client";

import type {
  Offer,
  ContactPerson,
  CreateOfferInput,
  UpdateOfferInput,
  CreateOfferPositionInput,
  CreateOfferFlatRatesInput,
  UpdateOfferFlatRatesInput,
  UpdateOfferPositionInput,
} from '@/types';

interface GetOffersParams {
  search?: string;
  companyIds?: string[];
  contactPersonIds?: string[];
  sort?: string;
}

export const getContactPersonsAction = () =>
  api<ContactPerson[]>("/api/contact-persons", { method: "GET" });

export const getOffersAction = (params?: GetOffersParams) => {
  const urlParams = new URLSearchParams();
  if (params?.search) urlParams.set("search", params.search);
  if (params?.companyIds) params.companyIds.forEach(id => urlParams.append("companyIds", id));
  if (params?.contactPersonIds) params.contactPersonIds.forEach(id => urlParams.append("contactPersonIds", id));
  if (params?.sort) urlParams.set("sort", params.sort);
  const query = urlParams.toString();
  const url = query ? `/api/offers?${query}` : "/api/offers";
  return api<Offer[]>(url, { method: "GET" });
};

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