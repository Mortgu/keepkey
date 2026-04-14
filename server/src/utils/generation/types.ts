import { Order, Product, User } from "@prisma/client";

export interface OfferData {
    companyName: string;
    customer: {
        salutation: string;
        firstName: string;
        lastName: string;
    };
    street: string;
    plzCity: string;

    paymentTerm: string;
    validUntil: string;
    customerId: string;
    suplirId: string;
    requestDate: string;
    employee: {
        salutation: string;
        firstName: string;
        lastName: string;
    };

    order: {
        invoiceNumber: string;
    };

    date: string;

    products: string;
};

export interface ShoppingCart {
    id: string,
    total: number,
    products: Product[],
}