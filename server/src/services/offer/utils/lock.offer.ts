import {Prisma} from "@prisma/client";

export default async function lockOffer(transaction: Prisma.TransactionClient, offerId: string) {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`offer-version:${offerId}`}))::text AS "lock"`;
    await transaction.$queryRaw`SELECT id FROM "offer" WHERE id = ${offerId} FOR UPDATE`;
}