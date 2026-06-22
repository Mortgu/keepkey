import type {Tariff, TariffCell, TariffHistory, TariffRow} from "@/types";
import {api} from "@/lib/api-client";


export const getAllTariffsAction = () =>
    api<Array<Tariff>>("/api/tariffs", {method: "GET"});

export const createTariffAction = (productId: string, contractId: string) =>
    api<Tariff>(`/api/tariffs/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({productId, contractId}),
    });

export const deleteTariffAction = (tariffId: string) =>
    api<void>(`/api/tariffs/${tariffId}`, {
        method: "DELETE"
    });

export const getProductTariffsAction = (productId: string) =>
    api<Array<Tariff>>(`/api/tariffs/${productId}`, {method: "GET"});

export const getTariffAction = (tariffId: string) =>
    api<Tariff>(`/api/tariffs/tariff/${tariffId}`, {method: "GET"});

export const getTariffHistoryAction = (productId: string, contractId: string) =>
    api<Array<TariffHistory>>(`/api/tariffs/history/${productId}/${contractId}`, {method: "GET"});

export const getTariffDurationsAction = (productId: string, contractId: string) =>
    api<Array<number>>(`/api/tariffs/durations/${productId}/${contractId}`, {method: "GET"});

export const createTariffColumnAction = (tariffId: string, duration: number) =>
    api<Tariff>(`/api/tariffs/${tariffId}/column`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration}),
    });

export const deleteTariffColumnAction = (tariffId: string, columnId: string) =>
    api<Tariff>(`/api/tariffs/${tariffId}/column/${columnId}`, {
        method: "DELETE",
    });

export const updateTariffColumnAction = (tariffId: string, columnId: string, duration: number) =>
    api<Tariff>(`/api/tariffs/${tariffId}/column/${columnId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration}),
    });

export const createTariffRowAction = (tariffId: string, min_quantity: number, max_quantity) =>
    api<TariffRow>(`/api/tariffs/${tariffId}/row`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({min_quantity, max_quantity}),
    });

export const deleteTariffRowAction = (tariffId: string, rowId: string) =>
    api<TariffRow>(`/api/tariffs/${tariffId}/row/${rowId}`, {
        method: "DELETE",
    });

export const updateTariffRowAction = (tariffId: string, rowId: string, min_qty: number, max_qty: number) =>
    api<TariffRow>(`/api/tariffs/${tariffId}/row/${rowId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({min_qty, max_qty}),
    });

export const updateTariffCellAction = (tariffId: string, cellId: string, default_price?: number, customer_price?: number) =>
    api<TariffCell>(`/api/tariffs/${tariffId}/cell/${cellId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({default_price, customer_price}),
    });

export const getTariffPrice = (
    productId: string,
    contractId: string,
    duration: number,
    quantity: number,
    customerId?: string,
) => {
    const params = new URLSearchParams({
        productId,
        contractId,
        duration: String(duration),
        quantity: String(quantity),
        ...(customerId ? {customerId} : {}),
    });
    return api<number>(`/api/tariffs/price?${params}`, {method: "GET"});
};