import { api } from "@/lib/api-client";
import type { ContactPerson, CreateOfferFlatrateInput, CreateOfferInput, CreateOfferPositionInput, Offer, OfferRevision, Task, UpdateOfferFlatrateInput, UpdateOfferInput, UpdateOfferPositionInput } from '@/types';



export const getContactPersonsAction = () =>
    api<Array<ContactPerson>>("/api/contact-persons", { method: "GET" });


export const createOfferAction = (offer: CreateOfferInput, positions: Array<CreateOfferPositionInput>, flatRates: Array<CreateOfferFlatrateInput>) =>
    api<Offer>("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer, positions, flatRates }),
    });

export const deleteOfferAction = (id: string) =>
    api<void>(`/api/offers/${id}`, { method: "DELETE" });

export const updateOfferAction = (
    id: string, offer: UpdateOfferInput, positions: Array<UpdateOfferPositionInput>, flatRates: Array<UpdateOfferFlatrateInput>,
) => api<Offer>(`/api/offers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, positions, flatRates }),
});

export const getOfferRevisionsAction = (offerId: string) =>
    api<Array<OfferRevision>>(`/api/offers/${offerId}/revisions`, { method: "GET" });

export const getTaskByIdAction = (taskId: string) =>
    api<Task>(`/api/tasks/${taskId}`, { method: 'GET' });
