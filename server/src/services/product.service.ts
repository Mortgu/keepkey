import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";

import type {
    CreateProductInput,
    UpdateProductInput,
    WorkloadFilterParams,

    productSchema,
    productListSchema,
} from '@keepit/schemas';
import type { z } from 'zod';

/* Server-seitige Sicht auf die Entity: Dates noch als Date, vor Serialisierung */
type Product = z.input<typeof productSchema>;
type ProductList = z.input<typeof productListSchema>;

export async function getProducts(filters: WorkloadFilterParams = {}): Promise<ProductList> {
    const { search, sort } = filters;
    const sortDir = sort?.split(":")[1] === "asc" ? "asc" : "desc";

    const products = await prisma.product.findMany({
        where: search
            ? { translations: { some: { name: { contains: search, mode: "insensitive" } } } }
            : undefined,
        orderBy: { createdAt: sortDir },
        include: { translations: true },
    });

    return products;
}

export async function getProduct(productId: string): Promise<Product> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { translations: true },
    });

    if (!product) {
        throw new AppException("Workload not found!", 404, "WORKLOAD_NOT_FOUND");
    }

    return product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
    const { translations } = input;

    const product = await prisma.product.create({
        data: {
            translations: {
                create: translations
            }
        },
        include: { translations: true }
    });

    return product;
}

export async function updateProduct(productId: string, input: UpdateProductInput): Promise<Product> {
    const { translations } = input;

    const result = await prisma.product.update({
        where: { id: productId },
        data: {
            ...(Array.isArray(translations)
                ? {
                    translations: {
                        upsert: translations.map((t: { language: "DE" | "EN"; name: string; description?: string | null; table?: string | null }) => ({
                            where: { productId_language: { productId: productId, language: t.language } },
                            create: { language: t.language, name: t.name, description: t.description, table: t.table },
                            update: { name: t.name, description: t.description, table: t.table },
                        })),
                    },
                }
                : {}),
        },
        include: { translations: true },
    });

    return result;
}

export async function deleteProduct(productId: string): Promise<void> {
    await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    await prisma.product.delete({ where: { id: productId } });
}