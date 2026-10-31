import {Prisma} from "@prisma/client";
import {documentOwnerType} from "@/services/document/document-repo.js";

/** After a change to the content, none of the documents created so far are suitable anymore. */
export async function invalidateCurrentDocuments(transaction: Prisma.TransactionClient, offerId: string): Promise<void> {
    await transaction.document.updateMany({
        where: { type: documentOwnerType("offer"), offerId, isCurrent: true },
        data: { isCurrent: false },
    });
}
