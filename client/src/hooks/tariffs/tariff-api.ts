import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    Tariff,
    TariffCell,
    TariffGroup,
    TariffRow,
    TariffVersion,
    UpdateTariffGroupInput,
} from '@keepit/schemas';
import { api } from "@/lib/api-client";


/* ───────────────────────────────
   TariffGroup
   ─────────────────────────────── */

export const getTariffGroups = () =>
    api<Array<TariffGroup>>('/api/tariffs', { method: "GET" });

export const getTariffGroup = (id: string) =>
    api<TariffGroup>(`/api/tariffs/${id}`, { method: "GET" });

export const createTariffGroup = (input: CreateTariffGroupInput) =>
    api<TariffGroup>('/api/tariffs', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const updateTariffGroup = (id: string, input: UpdateTariffGroupInput) =>
    api<TariffGroup>(`/api/tariffs/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteTariffGroup = (id: string) =>
    api<void>(`/api/tariffs/${id}`, { method: 'DELETE' });

/* ───────────────────────────────
   Tariff
   ─────────────────────────────── */

export const getTariff = (groupId: string, tariffId: string) =>
    api<Tariff>(`/api/tariffs/${groupId}/${tariffId}`, { method: "GET" });

export const createTariff = (groupId: string, input: CreateTariffInput) =>
    api<Tariff>(`/api/tariffs/${groupId}/tariffs`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteTariff = (groupId: string, tariffId: string) =>
    api<void>(`/api/tariffs/${groupId}/${tariffId}`, { method: "DELETE" });

export const getTariffVersions = (groupId: string, tariffId: string) =>
    api<Array<TariffVersion>>(`/api/tariffs/${groupId}/${tariffId}/versions`, { method: "GET" });

/** Versiegelt den aktuellen Stand als unveränderliche Version. */
export const sealTariffVersion = (groupId: string, tariffId: string) =>
    api<TariffVersion>(`/api/tariffs/${groupId}/${tariffId}/versions`, { method: "POST" });

export const restoreTariffVersion = (groupId: string, tariffId: string, versionId: string) =>
    api<Tariff>(`/api/tariffs/${groupId}/${tariffId}/versions/${versionId}/restore`, { method: "POST" });

export const getTariffDurations = (productId: string, contractId: string) =>
    api<Array<number>>(`/api/tariffs/durations/${productId}/${contractId}`, { method: "GET" });

/* ───────────────────────────────
   Tariff Column
   ─────────────────────────────── */

export const createTariffColumn = (groupId: string, tariffId: string, duration: number) =>
    api<Tariff>(`/api/tariffs/${groupId}/${tariffId}/column`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
    });

export const deleteTariffColumn = (groupId: string, tariffId: string, columnId: string) =>
    api<Tariff>(`/api/tariffs/${groupId}/${tariffId}/column/${columnId}`, {
        method: "DELETE",
    });

export const updateTariffColumn = (groupId: string, tariffId: string, columnId: string, duration: number) =>
    api<Tariff>(`/api/tariffs/${groupId}/${tariffId}/column/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
    });

/* ───────────────────────────────
   Tariff Row
   ─────────────────────────────── */

export const createTariffRow = (groupId: string, tariffId: string, min_quantity: number, max_quantity: number | null) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_quantity, max_quantity }),
    });

export const deleteTariffRow = (groupId: string, tariffId: string, rowId: string) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row/${rowId}`, {
        method: "DELETE",
    });

export const updateTariffRow = (groupId: string, tariffId: string, rowId: string, min_quantity: number, max_quantity: number | null) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_quantity, max_quantity }),
    });

/* ───────────────────────────────
   Tariff Cell
   ─────────────────────────────── */

export const updateTariffCell = (
    groupId: string,
    tariffId: string,
    cellId: string,
    default_price?: number,
    customer_price?: number,
) =>
    api<TariffCell>(`/api/tariffs/${groupId}/${tariffId}/cell/${cellId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_price, customer_price }),
    });

/* ───────────────────────────────
   Price

   Preisabfragen und kundenspezifische Preise liegen in `@/hooks/pricing` —
   dort, wo auch die eingefrorenen Preise der Erweiterungen herkommen.
   ─────────────────────────────── */
