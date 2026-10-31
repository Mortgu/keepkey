import { Prisma } from "@prisma/client";
import { createConfirmationSchema, type CreateConfirmationInput } from "@keepit/schemas";
import { AppException, assertNotFrozen } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { vatForOrder } from "./document-vat.js";
import { requestConfirmationGeneration } from "./document-generation-request.service.js";

const withDocuments = {
    documents: {
        where: { deletedAt: null },
        include: { artifacts: true },
        orderBy: { createdAt: "desc" as const },
    },
};

export async function getConfirmationByOrder(orderId: string) {
    return prisma.confirmation.findUnique({ where: { orderId }, include: withDocuments });
}

export async function createConfirmation(orderId: string, input: CreateConfirmationInput, actorId: string) {
    const data = createConfirmationSchema.parse(input);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, cancelledAt: true, confirmation: { select: { id: true } } },
    });
    if (!order) throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    assertNotFrozen(order.cancelledAt, "ORDER_CANCELLED", "Cancelled orders cannot be confirmed.");
    if (order.confirmation) throw new AppException("This order already has a confirmation.", 409, "CONFIRMATION_EXISTS");

    let confirmation;
    try {
        confirmation = await prisma.$transaction(async (tx) => tx.confirmation.create({
            data: {
                orderId,
                confirmationId: data.confirmationId,
                date: data.date ? new Date(data.date) : new Date(),
                createdById: actorId,
                ...(await vatForOrder(tx, orderId, data.taxRate)),
            },
        }));
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppException("This confirmation number is already in use.", 409, "CONFIRMATION_ID_TAKEN");
        }
        throw error;
    }

    await requestConfirmationGeneration(confirmation.id);
    return prisma.confirmation.findUniqueOrThrow({ where: { id: confirmation.id }, include: withDocuments });
}

export async function regenerateConfirmation(orderId: string) {
    const confirmation = await prisma.confirmation.findUnique({ where: { orderId }, select: { id: true } });
    if (!confirmation) throw new AppException("Confirmation not found", 404, "CONFIRMATION_NOT_FOUND");
    return requestConfirmationGeneration(confirmation.id);
}

export async function deleteConfirmation(orderId: string): Promise<void> {
    const confirmation = await prisma.confirmation.findUnique({
        where: { orderId },
        select: { id: true, documents: { where: { deletedAt: null }, select: { id: true } } },
    });
    if (!confirmation) throw new AppException("Confirmation not found", 404, "CONFIRMATION_NOT_FOUND");
    if (confirmation.documents.length > 0) {
        throw new AppException(
            "Delete the confirmation's document first.",
            409,
            "CONFIRMATION_HAS_DOCUMENT",
        );
    }

    await prisma.confirmation.delete({ where: { id: confirmation.id } });
}
