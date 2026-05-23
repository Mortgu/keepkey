import { api } from "@/lib/api-client";

import {
  type Offer,
  type OfferRevision,
  type ContactPerson,
  type CreateOfferInput,
  type UpdateOfferInput,
  type CreateOfferPositionInput,
  type CreateOfferFlatRatesInput,
  type UpdateOfferFlatRatesInput,
  type UpdateOfferPositionInput,
  type Document,
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

export const deleteOfferDocumentAction = (offerId: string, documentId: string) =>
  api<void>(`/api/offers/${offerId}/documents/${documentId}`, { method: "DELETE" });

export const updateOfferAction = (
  id: string, offer: UpdateOfferInput, positions: UpdateOfferPositionInput[], flatRates: UpdateOfferFlatRatesInput[],
) => api<Offer>(`/api/offers/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ offer, positions, flatRates }),
});

export const getOfferRevisionsAction = (offerId: string) =>
  api<OfferRevision[]>(`/api/offers/${offerId}/revisions`, { method: "GET" });

export const renameDocumentAction = (document_id: string, displayName: string) =>
  api<Document>(`/api/documents/${document_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      displayName
    })
  });

export const createReservationAction = (offer_id: string) =>
  api<String>(`/api/offers/${offer_id}/reserve`, {
    method: 'POST',
  });