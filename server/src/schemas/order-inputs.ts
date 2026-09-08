import { z } from "zod";
import { orderMetadataSchema } from "@keepit/schemas";
export { orderMetadataSchema, createOrderSchema as acceptOrderSchema, updateOrderSchema as updateOrderMetadataSchema } from "@keepit/schemas";
export type { CreateOrderInput as AcceptOrderInput, UpdateOrderInput as UpdateOrderMetadataInput } from "@keepit/schemas";
export const ORDER_REVISION_SNAPSHOT_VERSION = 1;

/** Bestellrevisionen enthalten ausschließlich Zusatzdaten. */
export function metadataSnapshot(order: {
    orderId: string;
    date: Date;
    projectNumber: string | null;
    projectDescription: string | null;
    orderDetails: string | null;
}) {
    return {
        order: orderMetadataSchema.parse({
            orderId: order.orderId,
            date: order.date.toISOString(),
            projectNumber: order.projectNumber,
            projectDescription: order.projectDescription,
            orderDetails: order.orderDetails,
        }),
    };
}
export function parseMetadataRevision(
    snapshot: unknown,
    snapshotVersion: number,
) {
    if (snapshotVersion !== ORDER_REVISION_SNAPSHOT_VERSION)
        throw new Error("Unsupported order revision");
    return z.object({ order: orderMetadataSchema }).parse(snapshot).order;
}
