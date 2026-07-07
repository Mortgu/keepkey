import type { components } from "./api";

export interface CustomerFilters {
    search?: string;
    sort?: string;
}

export type Customer = components["schemas"]["Customer"];
export type ContactPerson = components["schemas"]["ContactPerson"];

export type CreateCustomerInput = Pick<Customer,
    "companyName"
    | "country"
    | "email"
    | "invoiceEmail"
    | "language"
    | "street"
    | "salutation"
    | "zip"
    | "phone"
    | "currency"
    | "city"
    | "taxRate"
>;

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CreateCustomerContactInput = Pick<ContactPerson,
    "firstName"
    | "lastName"
    | "email"
    | "salutation"
    | "customerId"
>;

export type UpdateCustomerContactInput = Partial<CreateCustomerContactInput>;