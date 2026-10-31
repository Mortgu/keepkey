import {Prisma} from "@prisma/client";
import lockOffer from "@/services/offer/utils/lock.offer.js";
import {AppException, assertNotFrozen} from "@/lib/exceptions.js";

/** Must run inside the same transaction as every commercial mutation. */
export async function assertOfferEditable(tx: Prisma.TransactionClient, offerId: string) {
    await lockOffer(tx, offerId);

    const offer = await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { acceptedAt: true },
    });

    assertNotFrozen(
        offer.acceptedAt,
        "OFFER_ACCEPTED",
        "Accepted offers cannot be changed. Create a new offer instead."
    );
}

/** Optimistic Locking: Changes Only to the State Known to the Client */
export function assertExpectedVersion(current: { version: number }, expectedVersion: number): void {
    if (current.version !== expectedVersion) {
        throw new AppException(
            "The offer was changed by another user. Reload it and try again.",
            409,
            "VERSION_CONFLICT",
        );
    }
}