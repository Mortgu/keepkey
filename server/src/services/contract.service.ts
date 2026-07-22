import z from "zod";
import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    createContractSchema,
    updateContractSchema,
} from "../schemas/contract-schemas.js";

/* ========== Types ========== */

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;

/* ========== Queries ========== */

export async function getAllContracts() {
    return prisma.contract.findMany({
        include: {
            translations: true
        },
        orderBy: {
            createdAt: "desc"
        }
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

    return prisma.contract.create({
        data: {
            translations: { create: translations },
        },
        include: { translations: true },
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
