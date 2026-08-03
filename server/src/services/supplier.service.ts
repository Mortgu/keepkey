import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    CreateSupplierInput,
    UpdateSupplierInput,
} from "@keepit/schemas";


/* ========== Queries ========== */

export async function getSuppliers() {
    return prisma.supplier.findMany({
        include: {
            offers: true,
        }
    });
}

/* ========== Mutations ========== */

export async function createSupplier(input: CreateSupplierInput) {
    return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
    if (!id) {
        throw new AppException("Bad request! Missing id!", 400, "MISSING_ID");
    }

    const { supplierId, name } = input;

    const supplier = await prisma.supplier.update({
        where: { id },
        data: {
            supplierId,
            name,
        },
    });

    return supplier;
}

/* ========== Deletes ========== */

export async function deleteSupplier(id: string): Promise<void> {
    if (!id) {
        throw new AppException("Bad request! Missing id!", 400, "MISSING_ID");
    }

    await prisma.supplier.delete({
        where: { id },
    });
}
