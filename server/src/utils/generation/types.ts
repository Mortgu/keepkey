import { Order, User } from "@prisma/client";

export interface OfferData {
    order: {
        invoiceNumber: string,
    },
    customer?: User,
    employee?: User,
};