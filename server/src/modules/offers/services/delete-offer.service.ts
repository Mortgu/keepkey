import { prisma } from "@/core/prisma.js";
import { AppException } from "@/core/exceptions.js";
import { assertOfferEditable } from "../offer-acceptance.service.js";

export async function deleteOffer(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-generation:${id}`}))::text AS "lock"`;

        await assertOfferEditable(tx, id);

        if (await tx.offerDocument.count({ where: { offerId: id } }) > 0) {
            throw new AppException(
                "Offers with document history cannot be deleted.",
                409,
                "OFFER_HAS_DOCUMENT_HISTORY",
            );
        }

        await tx.offer.delete({ where: { id } });
    });
}
