import {DocumentOwnerType, Prisma} from "@prisma/client";

export async function invalidateOrderDocuments(transaction: Prisma.TransactionClient, orderId: string) {
    await transaction.document.updateMany({
        where: {
            type: DocumentOwnerType.ORDER,
            orderId: orderId,
            isCurrent: true
        },
        data: { isCurrent: false },
    });
}