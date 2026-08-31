import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    StandardDuration,
    StandardTier,
    Tariff,
    TariffCell,
    TariffGroup,
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
        body: JSON.stringify(input),
    });

export const updateTariffGroup = (id: string, input: UpdateTariffGroupInput) =>
    api<TariffGroup>(`/api/tariffs/${id}`, {
        method: 'PATCH',
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

/* ───────────────────────────────
   Standardlaufzeiten
   ─────────────────────────────── */

export const getStandardDurations = () =>
    api<Array<StandardDuration>>("/api/tariffs/standard-durations", { method: "GET" });

export const createStandardDuration = (months: number) =>
    api<StandardDuration>("/api/tariffs/standard-durations", {
        method: "POST",
        body: JSON.stringify({ months }),
    });

export const deleteStandardDuration = (id: string) =>
    api<void>(`/api/tariffs/standard-durations/${id}`, { method: "DELETE" });

/* ───────────────────────────────
   Standard-Mengenstaffeln
   ─────────────────────────────── */

export const getStandardTiers = () =>
    api<Array<StandardTier>>("/api/tariffs/standard-tiers", { method: "GET" });

export const createStandardTier = (min_quantity: number, max_quantity: number | null) =>
    api<StandardTier>("/api/tariffs/standard-tiers", {
        method: "POST",
        body: JSON.stringify({ min_quantity, max_quantity }),
    });

export const updateStandardTier = (id: string, min_quantity: number, max_quantity: number | null) =>
    api<StandardTier>(`/api/tariffs/standard-tiers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ min_quantity, max_quantity }),
    });

export const deleteStandardTier = (id: string) =>
    api<void>(`/api/tariffs/standard-tiers/${id}`, { method: "DELETE" });

export const getTariffDurations = (productId: string, contractId: string) =>
    api<Array<number>>(`/api/tariffs/durations/${productId}/${contractId}`, { method: "GET" });

/* ───────────────────────────────
   Zelle — adressiert über ihre Koordinate, nicht über eine Id
   ─────────────────────────────── */

export const updateTariffCell = (
    groupId: string,
    tariffId: string,
    duration: number,
    min_quantity: number,
    default_price: number,
) =>
    api<TariffCell>(`/api/tariffs/${groupId}/${tariffId}/cell`, {
        method: "PATCH",
        body: JSON.stringify({ duration, min_quantity, default_price }),
    });

/* ───────────────────────────────
   Price

   Preisabfragen und kundenspezifische Preise liegen in `@/hooks/pricing` —
   dort, wo auch die eingefrorenen Preise der Erweiterungen herkommen.
   ─────────────────────────────── */
