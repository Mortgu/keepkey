import { api } from "@/lib/api-client";
import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    Tariff,
    TariffCell,
    TariffGroup,
    TariffHistory,
    TariffRow,
    UpdateTariffGroupInput,
} from "@/types";

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

export const getTariffHistory = (productId: string, contractId: string) =>
    api<Array<TariffHistory>>(`/api/tariffs/history/${productId}/${contractId}`, { method: "GET" });

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

export const createTariffRow = (groupId: string, tariffId: string, min_quantity: number, max_quantity: number) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_quantity, max_quantity }),
    });

export const deleteTariffRow = (groupId: string, tariffId: string, rowId: string) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row/${rowId}`, {
        method: "DELETE",
    });

export const updateTariffRow = (groupId: string, tariffId: string, rowId: string, min_qty: number, max_qty: number) =>
    api<TariffRow>(`/api/tariffs/${groupId}/${tariffId}/row/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_qty, max_qty }),
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
   ─────────────────────────────── */

export const getTariffPrice = (
    productId: string,
    contractId: string,
    duration: number,
    quantity: number,
    customerId?: string,
    freeMonths?: number,
) => {
    const params = new URLSearchParams({
        productId,
        contractId,
        duration: String(duration),
        quantity: String(quantity),
        ...(customerId ? { customerId } : {}),
        ...(freeMonths ? { freeMonths: String(freeMonths) } : {}),
    });

    return api<TariffPriceResult>(`/api/tariffs/price?${params}`, { method: "GET" });
};

/* ───────────────────────────────
   Customer Price Override
   ─────────────────────────────── */

export type TariffPriceResult = {
    success: boolean;
    price: number;
    breakdown: { unitPrice: number; quantity: number; duration: number; freeMonths: number; effectiveDuration: number };
};

export const upsertCustomerPrice = (
    input: {
        productId: string;
        contractId: string;
        duration: number;
        quantity: number;
        customerId: string;
        price: number;
        optional: boolean;
    },
) =>
    api<TariffPriceResult>('/api/tariffs/customer-price', {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteCustomerPrice = (
    input: {
        productId: string;
        contractId: string;
        duration: number;
        quantity: number;
        customerId: string;
    },
) => {
    const params = new URLSearchParams({
        productId: input.productId,
        contractId: input.contractId,
        duration: String(input.duration),
        quantity: String(input.quantity),
        customerId: input.customerId,
    });
    return api<TariffPriceResult>(`/api/tariffs/customer-price?${params}`, {
        method: 'DELETE',
    });
};
