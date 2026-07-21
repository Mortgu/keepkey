import type { CreateFlatRateInput, FlatRate, UpdateFlatRateInput } from "@/types";
import { api } from "@/lib/api-client";

export const getFlatRates = () =>
    api<Array<FlatRate>>("/api/flatrates", { method: "GET" });

export const createFlatRate = (flatRate: CreateFlatRateInput) =>
    api<FlatRate>("/api/flatrates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatRate),
    });

export const updateFlatRate = (id: string, flatRate: Partial<UpdateFlatRateInput>) =>
    api<FlatRate>(`/api/flatrates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flatRate),
    });

export const deleteFlatRate = (id: string) =>
    api<void>(`/api/flatrates/${id}`, { method: "DELETE" });
