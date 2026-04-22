import { prisma } from "../lib/prisma.js";
import { formatDate } from "../utils/utils.js";
import { InvoiceTemplateData, OfferTemplateData } from "../utils/generation/types.js";

function formatEur(value: number): string {
    return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export async function getOfferTemplateData(offerId: string): Promise<OfferTemplateData> {
    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: {
            customer: true,
            customerContactPerson: true,
            user: true,
            offerPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    const { customer, customerContactPerson, user } = offer;

    const positions = offer.offerPositions.map((pos, index) => {
        const pricePerUnit = pos.totalPrice / pos.quantity;
        const price12 = pricePerUnit * pos.quantity * 12;
        const price36 = pricePerUnit * pos.quantity * 36;

        return {
            pos: index + 1,
            productName: pos.product.name,
            contractName: pos.contract.name,
            duration: pos.duration,
            quantity: pos.quantity,
            pricePerUnit: formatEur(pricePerUnit),
            price12: formatEur(price12),
            price36: formatEur(price36),
            totalPrice: formatEur(pos.totalPrice),
        };
    });

    const totalSum = offer.offerPositions.reduce((sum, p) => sum + p.totalPrice, 0);

    return {
        companyName: customer.companyName,
        contactFull: `${customerContactPerson.salutation} ${customerContactPerson.firstName} ${customerContactPerson.lastName}`,
        street: customer.street ?? "",
        plzCity: `${customer.plz ?? ""} ${customer.city ?? ""}`.trim(),

        voucherId: offer.voucherId,
        date: formatDate(offer.date),
        validUntil: formatDate(offer.validUntil),
        requestFrom: formatDate(offer.requestFrom),
        paymentTerm: offer.paymentTerm,

        customerContactPerson: `${customerContactPerson.salutation} ${customerContactPerson.lastName}`,
        contactPerson: `${user.salutation} ${user.firstName} ${user.lastName}`,

        positions,
        totalSum: formatEur(totalSum),
    };
}

export async function getInvoiceTemplateData(orderId: string): Promise<InvoiceTemplateData> {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            customer: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    const { customer } = order;

    const contactPerson = await prisma.contactPerson.findFirst({
        where: { customerId: customer.id }
    });

    const positions = order.orderPositions.map((pos, index) => {
        const lineTotal = pos.priceAtPurchase * pos.quantity;
        return {
            pos: index + 1,
            productName: pos.product.name,
            contractName: pos.contract.name,
            duration: pos.duration,
            quantity: pos.quantity,
            priceAtPurchase: formatEur(pos.priceAtPurchase),
            lineTotal: formatEur(lineTotal),
        };
    });

    const totalSum = order.orderPositions.reduce((sum, p) => sum + p.priceAtPurchase * p.quantity, 0);

    const contactFull = contactPerson
        ? `${contactPerson.salutation} ${contactPerson.firstName} ${contactPerson.lastName}`
        : "";

    return {
        companyName: customer.companyName,
        contactFull,
        street: customer.street ?? "",
        plzCity: `${customer.plz ?? ""} ${customer.city ?? ""}`.trim(),

        orderId: order.id,
        date: formatDate(order.createdAt ?? new Date()),

        positions,
        totalSum: formatEur(totalSum),
    };
}
