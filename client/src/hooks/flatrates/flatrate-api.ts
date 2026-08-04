import type {
    CreateFlatrateInput,
    Flatrate,

    UpdateFlatrateInput
} from '@keepit/schemas';
import { api } from "@/lib/api-client";


export const getFlatRates = () =>
    api<Array<Flatrate>>("/api/flatrates", { method: "GET" });

export const getFlatrate = (id: string) =>
    api<Flatrate>(`/api/flatrates/${id}`, { method: 'GET' });

export const createFlatRate = (flatRate: CreateFlatrateInput) =>
    api<Flatrate>("/api/flatrates", {
        method: "POST",
        body: JSON.stringify(flatRate),
    });

export const updateFlatRate = (id: string, flatRate: Partial<UpdateFlatrateInput>) =>
    api<Flatrate>(`/api/flatrates/${id}`, {
        method: "PUT",
        body: JSON.stringify(flatRate),
    });

export const deleteFlatRate = (id: string) =>
    api<void>(`/api/flatrates/${id}`, { method: "DELETE" });
