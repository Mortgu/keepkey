import { Prisma } from "@prisma/client";
import { createConfirmationSchema, type CreateConfirmationInput } from "@keepit/schemas";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { requestConfirmationGeneration } from "./confirmation-generation.service.js";

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

/**
 * Legt die AB zur Bestellung an und stößt direkt die Generierung an. Die
 * AB-Nummer ist danach fest — es gibt bewusst kein Update.
 */
export async function createConfirmation(orderId: string, input: CreateConfirmationInput, actorId: string) {
    const data = createConfirmationSchema.parse(input);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, cancelledAt: true, confirmation: { select: { id: true } } },
    });
    if (!order) throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    if (order.cancelledAt) throw new AppException("Cancelled orders cannot be confirmed.", 409, "ORDER_CANCELLED");
    if (order.confirmation) throw new AppException("This order already has a confirmation.", 409, "CONFIRMATION_EXISTS");

    let confirmation;
    try {
        confirmation = await prisma.confirmation.create({
            data: {
                orderId,
                confirmationId: data.confirmationId,
                date: data.date ? new Date(data.date) : new Date(),
                createdById: actorId,
            },
        });
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
