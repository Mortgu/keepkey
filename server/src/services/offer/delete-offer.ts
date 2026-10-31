import { prisma } from "@/lib/prismaClient.js";
import { documentOwnerType } from "../document/document-repo.js";
import { AppException } from "@/lib/exceptions.js";
import {assertOfferEditable} from "@/services/offer/utils/assert.offer.js";
import lockOffer from "@/services/offer/utils/lock.offer.js";

export async function deleteOffer(offerId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        await lockOffer(tx, offerId);

        await assertOfferEditable(tx, offerId);

        if (await tx.document.count({ where: { type: documentOwnerType("offer"), offerId: offerId } }) > 0) {
            throw new AppException(
                "Offers with document history cannot be deleted.",
                409,
                "OFFER_HAS_DOCUMENT_HISTORY",
            );
        }

        await tx.offer.delete({ where: { id: offerId } });
    });
}
