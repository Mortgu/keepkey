import { Product } from "@prisma/client";

/*  */
export interface OfferTemplateData {
    voucherId: string;      // "Beleg-Nr."
    date: string;             // "Datum"
    paymentTerm: string;    // "Zahlungsbedingung:"
    validUntil: string;       // "Angebot gültig bis:"
    requestFrom: string;      // "Ihre Anfrage vom:"
    supplierId: string;     // "Lieferantennummer"

    customer: TemplateData_Customer;
    employee: TemplateData_Employee;

    products: TemplateData_Products;
}

export interface TemplateData_Customer {
    id: string;             // "Kunden-Nr."
    companyName: string;
    street: string;
    plz: string;
    city: string;

    fullName: string;
    salutation: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface TemplateData_Employee {
    fullName: string;
    salutation: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface TemplateData_Products {
    names: string;
    positions: TemplateData_ProductPosition[];
    hasOptionals: boolean;
}

export interface TemplateData_ProductPosition {
    name: string;
    description: string;
    duration: string;
    quantity: string;
    contract: TemplateData_Contract;
    pricePerUnit: string;
    totalPrice: string;
    optional: boolean;
}

export interface TemplateData_Contract {
    name: string;
    features: string[];
}

export interface InvoicePositionTemplateData {
    pos: number;
    productName: string;
    contractName: string;
    duration: number;
    quantity: number;
    priceAtPurchase: string;
    lineTotal: string;
}

export interface InvoiceTemplateData {
    companyName: string;
    contactFull: string;
    street: string;
    plzCity: string;

    orderId: string;
    date: string;

    positions: InvoicePositionTemplateData[];
    totalSum: string;
}
