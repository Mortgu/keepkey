import { Prisma } from "@prisma/client";
import { AppException, assertNotFrozen } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { parseAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";
import {
    updateOrderMetadataSchema,
    type AcceptOrderInput,
    type UpdateOrderMetadataInput
} from "../schemas/order-inputs.js";
import { requestOrderGeneration } from "./document-generation-request.service.js";
import { documentOwnerType } from "./document-repo.js";
import { purchaseLines } from "./order-purchase.js";

import { getOfferById } from "./offer/offer-queries.js";

const orderInclude = { } satisfies Prisma.OrderInclude;

export async function getAllOrders() {
    const orders = prisma.order.findMany({});
    return orders;
}

export async function getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderInclude,
    });

    if (!order) {
       throw new AppException("Order not found!", 404, "ORDER_NOT_FOUND");
    }

    return order;
}

/* [POST] /api/orders/ */
export async function createOrder(input: AcceptOrderInput) {
    const { offerRefId } = input;

    const offerRef = await getOfferById(offerRefId);

    if (!offerRef) {
        throw new AppException("Failed to find offer reference for positions!", 500, "OFFER_NOT_FOUND");
    }

    const { offerPositions, customer } = offerRef;

    prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                orderId: input.orderId,
                projectNumber: input.projectNumber,
                projectDescription: input.projectDescription,
                orderDetails: input.orderDetails,

                vat: customer.taxRate,
                net_total: 0,
                gross_total: 0
            }
        });
        
        await tx.orderPosition.createMany({
            data: offerPositions.map(op => ({
            orderId: order.id,
            productId: op.productId,

            quantity: op.quantity,
            unit_price: op.eur_user_month,
            discount: op.discount_cents,
            net_total: op.total_cents,

            purchase_total_cents: op.total_cents,
        }))
        })
    });
}

/** Einkaufszeilen gegen den Accepted-Snapshot des Angebots rechnen und prüfen. */
async function purchaseLinesForOffer(
    tx: Prisma.TransactionClient,
    offerId: string,
    input: Parameters<typeof purchaseLines>[1],
) {
    const offer = await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { acceptedSnapshot: true },
    });
    const source = parseAcceptedOfferSnapshot(offer.acceptedSnapshot);
    return purchaseLines(source.positions, input);
}
async function lockOrder(
    tx: Prisma.TransactionClient,
    id: string,
    expectedVersion: number,
) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${id}`}))::text AS "lock"`;
    const order = await tx.order.findUniqueOrThrow({ where: { id } });
    if (order.version !== expectedVersion)
        throw new AppException(
            "The order changed. Reload it.",
            409,
            "VERSION_CONFLICT",
        );
    assertNotFrozen(order.cancelledAt, "ORDER_CANCELLED", "Cancelled orders cannot be changed.");
    return order;
}

async function invalidateDocuments(tx: Prisma.TransactionClient, orderId: string) {
    await tx.document.updateMany({
        where: { type: documentOwnerType("order"), orderId, isCurrent: true },
        data: { isCurrent: false },
    });
}

export async function updateOrder(id: string, input: UpdateOrderMetadataInput) {
    const data = updateOrderMetadataSchema.parse(input);

    return prisma.$transaction(async (tx) => {
        const current = await lockOrder(tx, id, data.expectedVersion);

        const lines = data.positions
            ? await purchaseLinesForOffer(tx, current.offerId, data.positions)
            : null;

        const order = await tx.order.update({
            where: { id },
            data: {
                ...data.order,
                date: new Date(data.order.date),
                contractStartDate: data.order.contractStartDate ? new Date(data.order.contractStartDate) : null,
                version: { increment: 1 },
                ...(lines ? { positions: { deleteMany: {}, create: lines } } : {}),
            },
        });

        await invalidateDocuments(tx, id);
        return order;
    });
}


export async function cancelOrder(id: string, expectedVersion: number) {
    return prisma.$transaction(async (tx) => {
        await lockOrder(tx, id, expectedVersion);

        const order = await tx.order.update({
            where: { id },
            data: { cancelledAt: new Date(), version: { increment: 1 } },
        });
        await invalidateDocuments(tx, id);
        return order;
    });
}

export async function createOrderTask(orderId: string): Promise<void> {
    await generateOrderDocument(orderId);
}

export async function generateOrderDocument(orderId: string) {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
    });

    assertNotFrozen(order.cancelledAt, "ORDER_CANCELLED", "Cancelled orders cannot generate documents.");

    return requestOrderGeneration(orderId);
}

export async function deleteOrderById(id: string): Promise<void> {
    await prisma.order.findUniqueOrThrow({
        where: { id },
        select: { id: true },
    });

    throw new AppException(
        "Orders preserve acceptance history. Cancel the order instead.",
        409,
        "ORDER_DELETE_FORBIDDEN",
    );
}
