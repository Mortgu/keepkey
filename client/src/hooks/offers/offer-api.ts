import type {
    CreateOfferFlatrateInput,
    CreateOfferInput,
    CreateOfferPositionInput,
    ExtendOfferInput,
    ExtensionPrice,
    Offer,
    OfferFilterParams,

    OfferPosition,
    OfferRevision,

    OffersPage,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload }),
    });

export const updateOffer = (id: string, input: UpdateOfferInput) =>
    api<Offer>(`/api/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const extendOffer = (offerId: string, input: ExtendOfferInput) =>
    api<Offer>(`/api/offers/${offerId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

/**
 * Preis einer Erweiterungsposition bei geänderter Menge — aufgelöst über die
 * Tarif-Version, die die Quellposition angepinnt hat.
 */
export const getExtensionPrice = (offerId: string, positionId: string, quantity: number) =>
    api<ExtensionPrice>(
        `/api/offers/${offerId}/positions/${positionId}/extension-price?quantity=${quantity}`,
        { method: "GET" },
    );