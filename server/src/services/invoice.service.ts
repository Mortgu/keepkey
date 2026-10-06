import { Prisma } from "@prisma/client";
import { createInvoiceSchema, type CreateInvoiceInput, type InvoiceFilterParams } from "@keepit/schemas";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { vatForOrder } from "./document-vat.js";
import { requestInvoiceGeneration } from "./invoice-generation.service.js";

const withDocuments = {
    documents: {
        where: { deletedAt: null },
        include: { artifacts: true },
        orderBy: { createdAt: "desc" as const },
    },
};

export async function getInvoiceByOrder(orderId: string) {
    return prisma.invoice.findUnique({ where: { orderId }, include: withDocuments });
}

export async function getAllInvoices(filters: InvoiceFilterParams = {}) {
    return prisma.invoice.findMany({
        where: {
            ...(filters.customerIds?.length ? { customerId: { in: filters.customerIds } } : {}),
            ...(filters.search
                ? {
                    OR: [
                        { invoiceId: { contains: filters.search, mode: "insensitive" } },
                        { order: { orderId: { contains: filters.search, mode: "insensitive" } } },
                        { customer: { companyName: { contains: filters.search, mode: "insensitive" } } },
                    ],
                }
                : {}),
        },
        include: {
            ...withDocuments,
            order: { select: { id: true, orderId: true } },
            customer: { select: { id: true, companyName: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Legt die Rechnung zur Bestellung an und stößt die Generierung an. Die
 * Rechnungsnummer ist danach fest — es gibt bewusst kein Update und kein Löschen.
 */
export async function createInvoice(orderId: string, input: CreateInvoiceInput, actorId: string) {
    const data = createInvoiceSchema.parse(input);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            cancelledAt: true,
            invoice: { select: { id: true } },
            offer: { select: { customerId: true } },
        },
    });
    if (!order) throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    if (order.cancelledAt) throw new AppException("Cancelled orders cannot be invoiced.", 409, "ORDER_CANCELLED");
    if (order.invoice) throw new AppException("This order already has an invoice.", 409, "INVOICE_EXISTS");

    let invoice;
    try {
        invoice = await prisma.$transaction(async (tx) => tx.invoice.create({
            data: {
                orderId,
                customerId: order.offer.customerId,
                invoiceId: data.invoiceId,
                date: data.date ? new Date(data.date) : new Date(),
                createdById: actorId,
                ...(await vatForOrder(tx, orderId, data.taxRate)),
            },
        }));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppException("This invoice number is already in use.", 409, "INVOICE_ID_TAKEN");
        }
        throw error;
    }

    await requestInvoiceGeneration(invoice.id);
    return prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id }, include: withDocuments });
}

export async function regenerateInvoice(orderId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { orderId }, select: { id: true } });
    if (!invoice) throw new AppException("Invoice not found", 404, "INVOICE_NOT_FOUND");
    return requestInvoiceGeneration(invoice.id);
}
