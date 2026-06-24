import { api } from "@/lib/api-client";
import { formatQueryString } from "@/lib/utils";
import type {
    CreateOfferFlatrateInput,
    CreateOfferInput,
    CreateOfferPositionInput,
    Offer,
    OfferDocument,
    OfferFilters,
    OfferPosition,
    OfferRevision,
    Task,
    UpdateOfferDocumentInput,
    UpdateOfferFlatrateInput,
    UpdateOfferInput,
    UpdateOfferPositionInput
} from "@/types";

/* Offer */
export const getOffers = async (filters: OfferFilters) =>
    api<Array<Offer>>(`/api/offers?${formatQueryString(filters)}`, {
        method: "GET"
    });

export const createOffer = (
    offer: CreateOfferInput,
    positions: Array<CreateOfferPositionInput>,
    flatrates: Array<CreateOfferFlatrateInput>
) =>
    api<Offer>("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            offer, positions, flatrates
        }),
    });

export const updateOffer = async (id: string, offer: UpdateOfferInput, positions: Array<UpdateOfferPositionInput>, flatrates: Array<UpdateOfferFlatrateInput>) =>
    api<Offer>(`/api/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer, positions, flatrates }),
    });

export const deleteOffer = async (id: string) =>
    api<void>(`/api/offers/${id}`, {
        method: "DELETE"
    });

/* Offer Position */
export const createOfferPositions = async (id: string, input: Array<CreateOfferPositionInput>) =>
    api<Array<OfferPosition>>(`/api/offers/${id}/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    });

export const updateOfferPosition = async (id: string, positionId: string, input: UpdateOfferPositionInput) =>
    api<OfferPosition>(`/api/offers/${id}/positions/${positionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const updateOfferFlatrate = async (id: string, flatrateId: string, input: UpdateOfferFlatrateInput) =>
    api<OfferPosition>(`/api/offers/${id}/flatrates/${flatrateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteOfferFlatrate = async (id: string, flatrateId: string) =>
    api<OfferPosition>(`/api/offers/${id}/flatrates/${flatrateId}`, {
        method: "DELETE"
    });


/* Offer Document */
export const createOfferDocument = async (id: string) =>
    api<Task>(`/api/offers/${id}/document`, {
        method: "POST"
    });

export const updateOfferDocument = async (id: string, documentId: string, input: UpdateOfferDocumentInput) =>
    api<OfferDocument>(`/api/offers/${id}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    })

export const deleteOfferDocument = async (id: string, documentId: string) =>
    api<void>(`/api/offers/${id}/documents/${documentId}`, {
        method: "DELETE"
    });

export const uploadOfferDocument = async (id: string, documentId: string) =>
    api<void>(`/api/offers/${id}/documents/${documentId}/upload`, {
        method: "POST"
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

export const deleteOfferRevision = async (id: string, revisionId: string) =>
    api<void>(`/api/offers/${id}/revisions/${revisionId}`, {
        method: "DELETE"
    });

/* Offer Tasks */
export const getOfferTasks = async (id: string) =>
    api<Array<Task>>(`/api/offers/${id}/tasks`, {
        method: "GET"
    });