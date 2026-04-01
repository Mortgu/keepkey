import { Order, User } from "@prisma/client";

export interface OfferData {
    order: Order,
    customer: User,
    employee: User,
};