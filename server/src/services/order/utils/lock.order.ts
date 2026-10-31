import {Prisma} from "@prisma/client";
import {AppException, assertNotFrozen} from "@/lib/exceptions.js";

export default async function lockOrder(transaction: Prisma.TransactionClient, orderId: string, expectedVersion: number) {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`order-version:${orderId}`}))::text AS "lock"`;

    const order = await transaction.order.findUniqueOrThrow({
        where: { id: orderId },
    });

    if (order.version !== expectedVersion) {
        throw new AppException(
            "The order changed. Reload it!",
            409,
            "VERSION_CONFLICT"
        );
    }

    assertNotFrozen(
        order.cancelledAt,
        "ORDER_CANCELLED",
        "Cancelled orders cannot be changed."
    );

    return order;
}