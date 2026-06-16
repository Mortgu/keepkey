import {api} from "@/lib/api-client";

import type {Tariff, TariffCell} from "@/types";

export const getAllTariffsAction = () =>
    api<Tariff[]>("/api/tariffs", {method: "GET"});

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
    api<Tariff[]>(`/api/tariffs/${productId}`, {method: "GET"});

export const getTariffAction = (tariffId: string) =>
    api<Tariff>(`/api/tariffs/tariff/${tariffId}`, {method: "GET"});

export const addTermAction = (tariffId: string, duration: number) =>
    api<Tariff>(`/api/tariffs/${tariffId}/terms`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration}),
    });

export const updateTermAction = (tariffId: string, termIndex: number, duration: number) =>
    api<Tariff>(`/api/tariffs/${tariffId}/terms`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({termIndex, duration}),
    })

export const removeTermAction = (tariffId: string, termIndex: number) =>
    api<Tariff>(`/api/tariffs/${tariffId}/terms`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({termIndex}),
    });

export const addBandAction = (tariffId: string, data: {
    min_quantity: number;
    max_quantity: number;
    prices: number[]
}) =>
    api<Tariff>(`/api/tariffs/${tariffId}/bands`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });

export const removeBandAction = (rowId: string) =>
    api<Tariff>(`/api/tariffs/bands/${rowId}`, {method: "DELETE"});

export const updateCellAction = (cellId: string, price: number) =>
    api<TariffCell>(`/api/tariffs/cells/${cellId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({price}),
    });

export const updateCustomerPriceAction = (cellId: string, customerId: string, price: number) =>
    api<Tariff>(`/api/tariffs/cells/${cellId}/customer-price`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({customerId, price}),
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