import { Order, User } from "@prisma/client";

export interface OfferData {
    companyName: string;
    contactPerson: string;
    street: string;
    plzCity: string;

    order: {
        invoiceNumber: string;
    };
    date: string;

    products: string;
};