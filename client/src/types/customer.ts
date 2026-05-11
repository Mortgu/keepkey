import type { components } from "./api";

export type Customer = components["schemas"]["Customer"];
export type ContactPerson = components["schemas"]["ContactPerson"];

export type CreateCustomerInput = Omit<
    Customer,
    "id" | "createdAt" | "updatedAt" | "orders" | "contactPersons" | "offers" | "users" | "tariffCustomers"
>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CreateContactPersonInput = Omit<
    ContactPerson,
    "id" | "createdAt" | "updatedAt" | "customer" | "offers"
>;
export type UpdateContactPersonInput = Partial<CreateContactPersonInput>;
