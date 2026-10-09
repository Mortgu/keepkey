import { Prisma } from "@prisma/client";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { parseAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";
import {
    acceptOrderSchema, updateOrderMetadataSchema,
    type AcceptOrderInput,
    type UpdateOrderMetadataInput
} from "../schemas/order-inputs.js";
import { requestOrderGeneration } from "./document-generation-request.service.js";
import { acceptOffer } from "./offer-acceptance.service.js";
import { purchaseLines } from "./order-purchase.js";
import { presentOrder } from "./order-source.js";

const orderInclude = {
    offer: true,
    positions: true,
    documents: {
        where: { deletedAt: null },
        orderBy: { version: "desc" },
        include: { artifacts: true, task: true },
    },
} satisfies Prisma.OrderInclude;

export interface OrderListQuery {
    companyIds?: unknown;
}
export async function getAllOrders(query: OrderListQuery = {}) {
    const raw = query.companyIds
        ? Array.isArray(query.companyIds)
            ? query.companyIds
            : [query.companyIds]
        : [];
    if (!raw.every((id) => typeof id === "string"))
        throw new AppException(
            "Invalid customer filter",
            400,
            "INVALID_FILTER",
        );
    const ids = raw as string[];
    const where: Prisma.OrderWhereInput = ids.length
        ? { offer: { customerId: { in: ids } } }
        : {};
    const orders = await prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
    });
    return orders.map(presentOrder);
}

export async function getOrderById(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });
    if (!order)
        throw new AppException("Order not found", 404, "ORDER_NOT_FOUND");
    return presentOrder(order);
}

/** A suggestion, not a reservation. The unique constraint rejects concurrent duplicates. */
export async function getNextOrderNumber(): Promise<string> {
    const prefix = `AB-${new Date().getFullYear()}-`;
    const [row] = await prisma.$queryRaw<{ next: bigint }[]>`
        SELECT COALESCE(MAX(substring("orderId" from '[0-9]+$')::bigint), 0) + 1 AS next
        FROM "order" WHERE "orderId" ~ ${`^${prefix}[0-9]+$`}
    `;
    return `${prefix}${String(row?.next ?? 1).padStart(3, "0")}`;
}
export async function createOrder(input: AcceptOrderInput, actorId: string) {
    const data = acceptOrderSchema.parse(input);
    return prisma.$transaction(
        async (tx) => {
            const acceptedAt = await acceptOffer(
                tx,
                data.id,
                data.expectedOfferVersion,
            );
            // Der Snapshot ist soeben entstanden — die Einkaufszeilen beziehen
            // sich auf genau diese Positionen.
            const lines = await purchaseLinesForOffer(tx, data.id, data.positions);
            return tx.order.create({
                data: {
                    offerId: data.id,
                    orderId: data.orderId,
                    date: data.date ? new Date(data.date) : acceptedAt,
                    projectNumber: data.projectNumber ?? null,
                    projectDescription: data.projectDescription ?? null,
                    orderDetails: data.orderDetails ?? null,
                    contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
                    acceptedAt,
                    acceptedById: actorId,
                    positions: { create: lines },
                },
            });
        },
        { timeout: 30_000 },
    );
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
    return purchaseLines(source.positions, input, source.duration_months);
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
    if (order.cancelledAt)
        throw new AppException(
            "Cancelled orders cannot be changed.",
            409,
            "ORDER_CANCELLED",
        );
    return order;
}

async function invalidateDocuments(tx: Prisma.TransactionClient, orderId: string) {
    await tx.orderDocument.updateMany({
        where: { orderId, isCurrent: true },
        data: { isCurrent: false },
    });
}

export async function updateOrder(id: string, input: UpdateOrderMetadataInput, actorId: string) {
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


export async function cancelOrder(id: string, expectedVersion: number, actorId: string) {
    return prisma.$transaction(async (tx) => {
        const current = await lockOrder(tx, id, expectedVersion);

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

    if (order.cancelledAt) {
        throw new AppException(
            "Cancelled orders cannot generate documents.",
            409,
            "ORDER_CANCELLED",
        );
    }

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
