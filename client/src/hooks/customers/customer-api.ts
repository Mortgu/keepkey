import type {
    ContactPerson,
    CreateCustomerContactInput,
    CreateCustomerInput,
    Customer,
    UpdateCustomerContactInput,
    UpdateCustomerInput
} from "@/types";
import { api } from "@/lib/api-client";

export const getCustomers = () =>
    api<Array<Customer>>(`/api/customers`, {
        method: "GET",
    });

export const getCustomer = (id: string) =>
    api<Customer>(`/api/customers/${id}`, {
        method: "GET",
    });

export const createCustomer = (input: CreateCustomerInput) =>
    api<Customer>(`/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    });

export const updateCustomer = (id: string, input: UpdateCustomerInput) =>
    api<Customer>(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    });

export const deleteCustomer = (id: string) =>
    api<void>(`/api/customers/${id}`, {
        method: "DELETE",
    });

export const createCustomerContact = (id: string, input: CreateCustomerContactInput) =>
    api<ContactPerson>(`/api/customers/${id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const updateCustomerContact = (id: string, contactId: string, input: UpdateCustomerContactInput) =>
    api<ContactPerson>(`/api/customers/${id}/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

export const deleteCustomerContact = (id: string, contactId: string) =>
    api<void>(`/api/customers/${id}/contacts/${contactId}`, {
        method: "DELETE",
    });