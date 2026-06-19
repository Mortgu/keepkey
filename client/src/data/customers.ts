import type {ContactPerson, CreateContactPersonInput, CreateCustomerInput, Customer, UpdateContactPersonInput, UpdateCustomerInput} from "@/types";
import { api } from "@/lib/api-client";


export const getAllCustomersAction = () =>
  api<Array<Customer>>("/api/customers", { method: "GET" });

export const getCustomerByIdAction = (id: string) =>
  api<Customer>(`/api/customers/${id}`, { method: "GET" });

export const createCustomerAction = (body: CreateCustomerInput) =>
  api<Customer>("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const createContactAction = (body: CreateContactPersonInput) =>
  api<ContactPerson>("/api/customers/contacts", {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

export const updateCustomerByIdAction = (id: string, body: UpdateCustomerInput) =>
  api<Customer>(`/api/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const updateContactAction = (id: string, body: UpdateContactPersonInput) =>
  api<ContactPerson>(`/api/customers/contacts/${id}`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteCustomerAction = (id: string) =>
  api<void>(`/api/customers/${id}`, {
    method: "DELETE",
  });

export const deleteContactAction = (id: string) =>
  api<void>(`/api/customers/contacts/${id}`, {
    method: 'DELETE',
  });
