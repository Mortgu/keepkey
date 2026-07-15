import { Prisma, Task, TaskTarget } from "@prisma/client";
import { enqueueTask } from "../lib/document.js";
import { prisma } from "../lib/prismaClient.js";

type GenerationRequestAdapter = {
    lockKey: string;
    target: TaskTarget;
    currentSourceVersion: (tx: Prisma.TransactionClient) => Promise<number>;
    findActive: (tx: Prisma.TransactionClient, sourceVersion: number) => Promise<{ task: Task } | null>;
    nextVersion: (tx: Prisma.TransactionClient) => Promise<number>;
    createDocument: (
        tx: Prisma.TransactionClient,
        taskId: string,
        version: number,
        sourceVersion: number,
    ) => Promise<void>;
};

async function requestGeneration(adapter: GenerationRequestAdapter): Promise<Task> {
    const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${adapter.lockKey}))::text AS "lock"`;

        const sourceVersion = await adapter.currentSourceVersion(tx);
        const active = await adapter.findActive(tx, sourceVersion);
        if (active) return { task: active.task, created: false };

        const version = await adapter.nextVersion(tx);
        const task = await tx.task.create({
            data: {
                status: "PENDING",
                type: "GENERATION",
                target: adapter.target,
            },
        });
        await adapter.createDocument(tx, task.id, version, sourceVersion);

        return { task, created: true };
    });

    await enqueueTask(result.task.id, { markFailedOnError: result.created });
    return result.task;
}

export function requestOfferGeneration(
    offerId: string,
    displayNameForVersion: (version: number) => string,
): Promise<Task> {
    return requestGeneration({
        lockKey: `offer-generation:${offerId}`,
        target: TaskTarget.OFFER,
        currentSourceVersion: async (tx) => (await tx.offer.findUniqueOrThrow({
            where: { id: offerId },
            select: { version: true },
        })).version,
        findActive: (tx, sourceVersion) => tx.offerDocument.findFirst({
            where: { offerId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.offer.update({
            where: { id: offerId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.offerDocument.create({
                data: {
                    displayName: displayNameForVersion(version),
                    offerId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}

export function requestOrderGeneration(orderId: string): Promise<Task> {
    return requestGeneration({
        lockKey: `order-generation:${orderId}`,
        target: TaskTarget.ORDER,
        currentSourceVersion: async (tx) => (await tx.order.findUniqueOrThrow({
            where: { id: orderId },
            select: { version: true },
        })).version,
        findActive: (tx, sourceVersion) => tx.orderDocument.findFirst({
            where: { orderId, sourceVersion, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        }),
        nextVersion: async (tx) => (await tx.order.update({
            where: { id: orderId },
            data: { documentVersion: { increment: 1 } },
            select: { documentVersion: true },
        })).documentVersion,
        createDocument: async (tx, taskId, version, sourceVersion) => {
            await tx.orderDocument.create({
                data: {
                    orderId,
                    version,
                    sourceVersion,
                    isCurrent: false,
                    status: "PENDING",
                    taskId,
                },
            });
        },
    });
}
