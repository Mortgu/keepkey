import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { CreateProductInput, UpdateProductInput } from "../schemas/product-schemas.js";

export async function getProducts() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            translations: true,
        },
    });

    return products;
}

export async function getProduct(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            translations: true,
        },
    });

    if (!product) {
        throw new AppException("Workload not found!", 404, "WORKLOAD_NOT_FOUND");
    }

    return product;
}

export async function createProduct(input: CreateProductInput) {
    const { translations } = input;

    const product = await prisma.product.create({
        data: {
            translations: {
                create: translations
            }
        },
        include: {
            translations: true,
        }
    });

    return product;
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
    const { translations } = input;

    const result = await prisma.product.update({
        where: { id: productId },
        data: {
            ...(Array.isArray(translations)
                ? {
                    translations: {
                        upsert: translations.map((t: { language: "DE" | "EN"; name: string; description?: string; table?: string }) => ({
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