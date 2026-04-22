import { Product } from "@prisma/client";

export interface OfferPositionTemplateData {
    pos: number;
    label: string;
    productName: string;
    contractName: string;
    features: string[];
    duration: number;
    quantity: number;
    pricePerUnit: string;
    totalPrice: string;
}

export interface OfferTemplateData {
    companyName: string;
    contactFull: string;
    street: string;
    plzCity: string;

    products: string;

    voucherId: string;
    date: string;
    validUntil: string;
    requestFrom: string;
    paymentTerm: string;

    customerContactPerson: string;
    contactPerson: string;

    hasOptionalPositions: boolean;
    positions: OfferPositionTemplateData[];
    totalSum: string;
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

export interface ShoppingCart {
    id: string;
    total: number;
    products: Product[];
}
