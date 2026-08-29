import { Prisma } from "@prisma/client";
import type { ActivityFilterParams, RecordActivityInput } from "@keepit/schemas";

import { prisma } from "@/lib/prismaClient.js";
import { currentActorId } from "@/lib/request-context.js";
import logger from "@/utils/logger.js";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

function toCreateData(input: RecordActivityInput): Prisma.ActivityUncheckedCreateInput {
    return {
        type: input.type,
        entity: input.entity,
        entityId: input.entityId,
        actorId: input.actorId ?? currentActorId(),
        customerId: input.customerId ?? null,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    };
}

/**
 * Innerhalb der Transaktion aufrufen, in der die Aenderung passiert — ein
 * Rollback darf keinen Feed-Eintrag hinterlassen.
 */
export async function recordActivity(tx: Prisma.TransactionClient, input: RecordActivityInput) {
    return tx.activity.create({ data: toCreateData(input) });
}

/**
 * Fuer Aufrufer ohne offene Transaktion. Immer *nach* dem erfolgreichen Write
 * aufrufen. Ein fehlgeschlagener Feed-Eintrag darf die eigentliche Aktion nie
 * kippen, deshalb wird der Fehler nur geloggt.
 */
export async function recordActivityStandalone(input: RecordActivityInput) {
    try {
        return await prisma.activity.create({ data: toCreateData(input) });
    } catch (error) {
        logger.error("activity_record_failed", { error, type: input.type, entityId: input.entityId });
        return null;
    }
}

type Cursor = { createdAt: Date; id: string };

function parseCursor(raw: string | undefined): Cursor | null {
    if (!raw) return null;

    const separator = raw.lastIndexOf("|");
    if (separator < 0) return null;

    const createdAt = new Date(raw.slice(0, separator));
    const id = raw.slice(separator + 1);

    if (Number.isNaN(createdAt.getTime()) || !id) return null;

    return { createdAt, id };
}

export async function getActivities(query: ActivityFilterParams) {
    const limitRaw = Number(query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.trunc(limitRaw), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const cursor = parseCursor(query.cursor);

    /*
     * Keyset-Pagination statt skip/take: in den Feed wird oben laufend
     * eingefuegt, Offset-Paging wuerde dabei Zeilen doppelt ausliefern.
     */
    const where: Prisma.ActivityWhereInput = {
        ...(query.entity ? { entity: query.entity } : {}),
        ...(cursor
            ? {
                OR: [
                    { createdAt: { lt: cursor.createdAt } },
                    { createdAt: cursor.createdAt, id: { lt: cursor.id } },
                ],
            }
            : {}),
    };

    const rows = await prisma.activity.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: {
            actor: { select: { id: true, name: true, firstName: true, lastName: true } },
        },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];

    return {
        items: page.map((row) => ({
            id: row.id,
            type: row.type,
            entity: row.entity,
            entityId: row.entityId,
            actor: row.actor
                ? {
                    id: row.actor.id,
                    name: row.actor.name?.trim()
                        || `${row.actor.firstName} ${row.actor.lastName}`.trim(),
                }
                : null,
            payload: row.payload ?? {},
            createdAt: row.createdAt.toISOString(),
        })),
        nextCursor: hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : null,
    };
}
