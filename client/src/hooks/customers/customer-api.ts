import type {
    Contact,
    ContactList,
    CreateContactInput,
    CreateCustomerInput,

    Customer,
    CustomerFilterParams,
    UpdateContactInput,
    UpdateCustomerInput
} from '@keepit/schemas';
import { api } from "@/lib/api-client";


export const getCustomers = (filters: CustomerFilterParams = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);

    const qs = params.toString();
    return api<Array<Customer>>(`/api/customers${qs ? `?${qs}` : ""}`, {
        method: "GET",
    });
};

export const getContacts = () =>
    api<ContactList>(`/api/contact-persons`, {
        method: "GET",
    });

export const getCustomer = (id: string) =>
    api<Customer>(`/api/customers/${id}`, {
        method: "GET",
    });

export const createCustomer = (input: CreateCustomerInput) =>
    api<Customer>(`/api/customers`, {
        method: "POST",
        body: JSON.stringify(input)
    });

export const updateCustomer = (id: string, input: UpdateCustomerInput) =>
    api<Customer>(`/api/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
    });

export const deleteCustomer = (id: string) =>
    api<void>(`/api/customers/${id}`, {
        method: "DELETE",
    });

export const createCustomerContact = (id: string, input: CreateContactInput) =>
    api<Contact>(`/api/customers/${id}/contacts`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export const updateCustomerContact = (id: string, contactId: string, input: UpdateContactInput) =>
    api<Contact>(`/api/customers/${id}/contacts/${contactId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });

export const deleteCustomerContact = (id: string, contactId: string) =>
    api<void>(`/api/customers/${id}/contacts/${contactId}`, {
        method: "DELETE",
    });