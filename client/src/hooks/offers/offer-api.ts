import type {
    CreateOfferInput,
    ExtendOfferInput,
    Offer,
    OfferFilterParams,

    OfferRevision,

    OffersPage,
    Task,

    UpdateOfferInput
} from "@keepit/schemas";
import { api } from "@/lib/api-client";
import { formatQueryString } from "@/lib/utils";


/* Offer */
export const getOffers = async (filters: OfferFilterParams) =>
    api<OffersPage>(`/api/offers?${formatQueryString(filters)}`, {
        method: "GET"
    });

export const createOffer = (payload: CreateOfferInput) =>
    api<Offer>("/api/offers", {
        method: "POST",
        body: JSON.stringify({ ...payload }),
    });

export const updateOffer = (id: string, input: UpdateOfferInput) =>
    api<Offer>(`/api/offers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

export const deleteOffer = async (id: string) =>
    api<void>(`/api/offers/${id}`, {
        method: "DELETE"
    });

export const generateOfferDocument = async (id: string) =>
    api<Task>(`/api/offers/${id}/documents`, {
        method: "POST"
    });

/* Offer Revisions */
export const getOfferRevisions = async (id: string) =>
    api<Array<OfferRevision>>(`/api/offers/${id}/revisions`, {
        method: "GET"
    });

export const restoreOfferRevision = async (id: string, revisionId: string, expectedVersion: number) =>
    api<Offer>(`/api/offers/${id}/revisions/${revisionId}/restore`, {
        method: "POST",
        body: JSON.stringify({ expectedVersion }),
    });

export const getTask = async (taskId: string) =>
    api<Task>(`/api/tasks/${taskId}`, {
        method: "GET"
    });

export const renewOffer = (offerId: string, input: CreateOfferInput) =>
    api<Offer>(`/api/offers/${offerId}/renew`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export const extendOffer = (offerId: string, input: ExtendOfferInput) =>
    api<Offer>(`/api/offers/${offerId}/extend`, {
        method: "POST",
        body: JSON.stringify(input),
    });
