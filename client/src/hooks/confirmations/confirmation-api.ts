import type { Confirmation, CreateConfirmationInput, Task } from "@keepit/schemas";
import { api } from "@/lib/api-client";

export const getConfirmationByOrder = (orderId: string) =>
    api<Confirmation | null>(`/api/orders/${orderId}/confirmation`, { method: "GET" });

export const createConfirmation = (orderId: string, input: CreateConfirmationInput) =>
    api<Confirmation>(`/api/orders/${orderId}/confirmation`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export const regenerateConfirmation = (orderId: string) =>
    api<Task>(`/api/orders/${orderId}/confirmation/documents`, { method: "POST" });
