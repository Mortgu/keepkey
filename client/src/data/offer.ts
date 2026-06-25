import { api } from "@/lib/api-client";
import type { ContactPerson, CreateOfferFlatRatesInput, CreateOfferInput, CreateOfferPositionInput, Document, Offer, OfferRevision, Task, UpdateOfferFlatRatesInput, UpdateOfferInput, UpdateOfferPositionInput } from '@/types';



export const getContactPersonsAction = () =>
    api<Array<ContactPerson>>("/api/contact-persons", { method: "GET" });


export const createOfferAction = (offer: CreateOfferInput, positions: Array<CreateOfferPositionInput>, flatRates: Array<CreateOfferFlatRatesInput>) =>
    api<Offer>("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer, positions, flatRates }),
    });

export const deleteOfferAction = (id: string) =>
    api<void>(`/api/offers/${id}`, { method: "DELETE" });

export const deleteOfferDocumentAction = (offerId: string, documentId: string) =>
    api<void>(`/api/offers/${offerId}/documents/${documentId}`, {
        method: "DELETE"
    });

export const updateOfferAction = (
    id: string, offer: UpdateOfferInput, positions: Array<UpdateOfferPositionInput>, flatRates: Array<UpdateOfferFlatRatesInput>,
) => api<Offer>(`/api/offers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, positions, flatRates }),
});

export const getOfferRevisionsAction = (offerId: string) =>
    api<Array<OfferRevision>>(`/api/offers/${offerId}/revisions`, { method: "GET" });

export const renameDocumentAction = (document_id: string, displayName: string) =>
    api<Document>(`/api/documents/${document_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            displayName
        })
    });

export const uploadAction = (offerId: string, documentId: string) =>
    api<void>(`/api/offers/${offerId}/upload/${documentId}`, {
        method: 'POST',
    })

export const getTaskByIdAction = (taskId: string) =>
    api<Task>(`/api/tasks/${taskId}`, { method: 'GET' });

export const generateOfferDocumentAction = (offerId: string) =>
    api<{ taskId: string }>(`/api/offers/${offerId}/document`, { method: 'POST' });