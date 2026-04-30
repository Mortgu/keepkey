import { api } from "@/lib/api-client";
import type { CreateCustomer, Customer } from "./types";

export const getAllCustomersAction = () =>
  api<Customer[]>("/api/customers", { method: "GET" });

export const getCustomerByIdAction = (id: string) =>
  api<Customer>(`/api/customers/${id}`, { method: "GET" });

export const createCustomerAction = (body: CreateCustomer) =>
  api<Customer>("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateCustomerByIdAction = (id: string, body: Partial<Customer>) =>
  api<Customer>(`/api/customers/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteCustomerAction = (id: string) =>
  api<void>(`/api/customers/${id}`, {
    method: "POST",
  });
