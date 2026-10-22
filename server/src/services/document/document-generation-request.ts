import { Task } from "@prisma/client";
import type { DocumentType } from "@keepit/schemas";
import { assertNotFrozen } from "../../lib/exceptions.js";
import { enqueueTask } from "../../lib/document.js";
import { prisma } from "../../lib/prismaClient.js";
import { documentTypes, ownerColumn } from "./document-types.js";

/**
 * Legt ein neues, wartendes Dokument samt Task an — oder gibt den Task einer
 * bereits laufenden Generierung derselben Quellversion zurück. Regenerieren legt
 * immer eine neue Version an und löscht nie eine alte (ADR-0001).
 */
export async function requestGeneration(type: DocumentType, ownerId: string): Promise<Task> {
    const definition = documentTypes[type];
    const owner = ownerColumn(definition.ownerKey, ownerId);

    const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`${type}-generation:${ownerId}`}))::text AS "lock"`;
        await definition.lockOwner(tx, ownerId);
        assertNotFrozen(
            await definition.frozenAt(tx, ownerId),
            definition.frozen.code,
            `${definition.frozen.subject} cannot generate new documents.`,
        );

        const sourceVersion = await definition.currentSourceVersion(tx, ownerId);
        const active = await tx.document.findFirst({
            where: {
                type: definition.ownerType,
                ...owner,
                sourceVersion,
                deletedAt: null,
                status: { in: ["PENDING", "PROCESSING"] },
            },
            select: { task: true },
        });
        if (active) return { task: active.task, created: false };

        const version = await definition.nextDocumentVersion(tx, ownerId);
        const task = await tx.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: definition.taskTarget,
            },
        });
        await tx.document.create({
            data: {
                type: definition.ownerType,
                ...owner,
                version,
                sourceVersion,
                isCurrent: false,
                status: "PENDING",
                taskId: task.id,
            },
        });

        return { task, created: true };
    });

    await enqueueTask(result.task.id, { markFailedOnError: result.created });
    return result.task;
}
