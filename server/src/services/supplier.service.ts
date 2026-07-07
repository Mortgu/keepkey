import z from "zod";
import { prisma } from "../lib/prismaClient.js";
import type { Supplier } from "@prisma/client";
import { AppException } from "../lib/exceptions.js";
import {
    createSupplierSchema,
    updateSupplierSchema,
} from "../schemas/supplier-schemas.js";

/* ========== Types ========== */

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

/* ========== Queries ========== */

export async function getSuppliers() {
    return prisma.supplier.findMany({
        include: {
            offers: true,
        }
    });
}

/* ========== Mutations ========== */

export async function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: UpdateSupplierInput): Promise<Supplier> {
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
