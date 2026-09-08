import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    CreateSupplierInput,
    SupplierFilterParams,
    UpdateSupplierInput,
} from "@keepit/schemas";


/* ========== Queries ========== */

export async function getSuppliers(query: SupplierFilterParams) {
    const { search, sort } = query;

    const where: {
        name?: { contains: string };
    } = {};

    if (search && typeof search === "string") {
        where.name = { contains: search };
    }

    const orderBy = sort === "createdAt:asc" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

    const suppliers = await prisma.supplier.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy,
        include: {
            _count: {
                select: { offers: true },
            }
        }
    });
    const counts = await prisma.offer.groupBy({ by: ["supplierId"],
        where: { supplierId: { in: suppliers.map(s => s.id) }, orders: { isNot: null } }, _count: { _all: true } });
    const orderCounts = new Map(counts.map(c => [c.supplierId, c._count._all]));
    return suppliers.map(s => ({ ...s, _count: { ...s._count, orders: orderCounts.get(s.id) ?? 0 } }));
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
