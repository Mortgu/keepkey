import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";

/* ========== Types ========== */

export type RenameDocumentInput = { displayName: string };

/* ========== Mutations ========== */

export async function renameDocument(id: string, input: RenameDocumentInput) {
    const { displayName } = input;

    return prisma.offerDocument.update({
        where: { id },
        data: { displayName },
    });
}

/* ========== Deletes ========== */

export async function deleteDocument(id: string): Promise<void> {
    await prisma.document.delete({
        where: { id },
    });
}
