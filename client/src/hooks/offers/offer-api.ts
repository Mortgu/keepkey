import type {
    CreateOfferFlatrateInput,
    CreateOfferInput,
    CreateOfferPositionInput,
    ExtendOfferInput,
    Offer,
    OfferFilterParams,

    OfferPosition,
    OfferRevision,

    OffersPage,
    QuoteIdAvailability,
    QuoteIdSuggestion,
    Task,

    UpdateOfferFlatrateInput,
    UpdateOfferInput,
    UpdateOfferPositionInput
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

/* Offer Position */
export const createOfferPositions = async (id: string, input: Array<CreateOfferPositionInput>) =>
    api<Array<OfferPosition>>(`/api/offers/${id}/positions`, {
        method: "POST",
        body: JSON.stringify(input)
    });

export const updateOfferPosition = async (id: string, positionId: string, input: UpdateOfferPositionInput) =>
    api<OfferPosition>(`/api/offers/${id}/positions/${positionId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

export const deleteOfferPosition = async (id: string, positionId: string) =>
    api<OfferPosition>(`/api/offers/${id}/positions/${positionId}`, {
        method: "DELETE"
    });

/* Offer Flatrates */
export const createOfferFlatrates = async (id: string, input: Array<CreateOfferFlatrateInput>) =>
    api<Array<OfferPosition>>(`/api/offers/${id}/flatrates`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export const updateOfferFlatrate = async (id: string, flatrateId: string, input: UpdateOfferFlatrateInput) =>
    api<OfferPosition>(`/api/offers/${id}/flatrates/${flatrateId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

export const deleteOfferFlatrate = async (id: string, flatrateId: string) =>
    api<OfferPosition>(`/api/offers/${id}/flatrates/${flatrateId}`, {
        method: "DELETE"
    });


export const generateOfferDocument = async (id: string) =>
    api<Task>(`/api/offers/${id}/documents`, {
        method: "POST"
    });

/* Belegnummern */
export const getNextQuoteId = async () =>
    api<QuoteIdSuggestion>("/api/offers/next-quote-id", {
        method: "GET"
    });

export const getQuoteIdAvailability = async (quoteId: string) =>
    api<QuoteIdAvailability>(`/api/offers/quote-id/${encodeURIComponent(quoteId)}/availability`, {
        method: "GET"
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

/* Offer Tasks */
export const getOfferTasks = async (id: string) =>
    api<Array<Task>>(`/api/offers/${id}/tasks`, {
        method: "GET"
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
