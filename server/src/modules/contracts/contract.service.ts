import { prisma } from "@/core/prisma.js";
import { AppException } from "@/core/exceptions.js";
import { Prisma } from "@prisma/client";
import { CreateContractInput, UpdateContractInput } from "@keepit/schemas";

/**
 * Einheitliche Tarif-Reihenfolge für alle Listen: der erste Tarif ist der
 * Standard, bei gleichem Rang entscheidet das Alter.
 */
export const contractOrderBy = [
    { sortOrder: "asc" },
    { createdAt: "asc" },
] satisfies Prisma.ContractOrderByWithRelationInput[];

/* ========== Queries ========== */

export async function getAllContracts() {
    return prisma.contract.findMany({
        include: {
            translations: true
        },
        orderBy: contractOrderBy,
    });
}

export async function getContract(contractId: string) {
    return prisma.contract.findUnique({
        where: { id: contractId },
        include: {
            translations: true
        }
    });
}

/* ========== Mutations ========== */

export async function createContract(input: CreateContractInput) {
    const { translations } = input;

    // Neue Tarife landen hinten und ändern so den Standard nicht.
    const { _max } = await prisma.contract.aggregate({ _max: { sortOrder: true } });

    return prisma.contract.create({
        data: {
            sortOrder: (_max.sortOrder ?? -1) + 1,
            translations: { create: translations },
        },
        include: { translations: true },
    });
}

/**
 * Übernimmt die komplette neue Reihenfolge. Die Liste muss genau alle Tarife
 * enthalten — sonst hat sich der Bestand seit dem Laden geändert.
 */
export async function reorderContracts(ids: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const existing = await tx.contract.findMany({ select: { id: true } });
        const requested = new Set(ids);

        if (requested.size !== ids.length
            || requested.size !== existing.length
            || existing.some(({ id }) => !requested.has(id))) {
            throw new AppException(
                "Die Tarife wurden zwischenzeitlich geändert. Bitte neu laden.",
                409,
                "CONTRACT_ORDER_STALE",
            );
        }

        for (const [sortOrder, id] of ids.entries()) {
            await tx.contract.update({ where: { id }, data: { sortOrder } });
        }
    });
}

export async function updateContract(id: string, input: UpdateContractInput) {
    if (!id) {
        throw new AppException("Bad request! Missing id!", 400, "MISSING_ID");
    }

    const { translations } = input;

    return prisma.contract.update({
        where: { id },
        data: {
            ...(Array.isArray(translations)
                ? {
                    translations: {
                        upsert: translations.map((t) => ({
                            where: { contractId_language: { contractId: id, language: t.language } },
                            create: { language: t.language, name: t.name, features: t.features ?? [], table: t.table },
                            update: { name: t.name, features: t.features ?? [], table: t.table },
                        })),
                    },
                }
                : {}),
        },
        include: { translations: true },
    });
}

/* ========== Deletes ========== */

export async function deleteContract(id: string): Promise<void> {
    if (!id) {
        throw new AppException("Bad request! Missing id!", 400, "MISSING_ID");
    }

    await prisma.contract.delete({
        where: { id },
    });
}
