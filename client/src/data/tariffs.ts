import { api } from "@/lib/api-client";

import type {
  Tariff,
  TariffConfig,
  TariffCustomer,
  CreateTariffInput,
  UpdateTariffInput,
  CreateTariffConfigInput,
  UpdateTariffConfigInput,
  CreateTariffCustomerInput,
  UpdateTariffCustomerInput,
} from "@/types";

export const getAllTariffsAction = () =>
  api<Tariff[]>("/api/tariffs", { method: "GET" });

export const createTariffAction = (body: CreateTariffInput) =>
  api<Tariff>("/api/tariffs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateTariffAction = (id: string, body: UpdateTariffInput) =>
  api<Tariff>(`/api/tariffs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteTariffAction = (id: string) =>
  api<void>(`/api/tariffs/${id}`, { method: "DELETE" });

export const addTariffConfigAction = (
  tariffId: string,
  body: CreateTariffConfigInput,
) =>
  api<TariffConfig>(`/api/tariffs/${tariffId}/configs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateTariffConfigAction = (
  tariffId: string,
  configId: string,
  body: UpdateTariffConfigInput,
) =>
  api<TariffConfig>(`/api/tariffs/${tariffId}/configs/${configId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteTariffConfigAction = (tariffId: string, configId: string) =>
  api<void>(`/api/tariffs/${tariffId}/configs/${configId}`, {
    method: "DELETE",
  });

export const addTariffCustomerAction = (
  tariffId: string,
  body: CreateTariffCustomerInput,
) =>
  api<TariffCustomer>(`/api/tariffs/${tariffId}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateTariffCustomerAction = (
  tariffId: string,
  tariffCustomerId: string,
  body: UpdateTariffCustomerInput,
) =>
  api<TariffCustomer>(`/api/tariffs/${tariffId}/customers/${tariffCustomerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteTariffCustomerAction = (
  tariffId: string,
  tariffCustomerId: string,
) =>
  api<void>(`/api/tariffs/${tariffId}/customers/${tariffCustomerId}`, {
    method: "DELETE",
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
    ...(customerId ? { customerId } : {}),
  });
  return api<number>(`/api/tariffs/price?${params}`, { method: "GET" });
};
