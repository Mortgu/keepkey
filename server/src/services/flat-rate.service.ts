import { prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    CreateFlatrateInput,
    FlatrateFilterParams,
    UpdateFlatrateInput
} from "@keepit/schemas";

/* ========== Queries ========== */

export async function getFlatRates(filters: FlatrateFilterParams = {}) {
    const { search, sort } = filters;
    const sortDir = sort?.split(":")[1] === "asc" ? "asc" : "desc";

    return prisma.flatRate.findMany({
        where: search
            ? { translations: { some: { name: { contains: search, mode: "insensitive" } } } }
            : undefined,
        orderBy: { createdAt: sortDir },
        include: { translations: true },
    });
}

export async function getFlatrate(id: string) {
    return prisma.flatRate.findUnique({
        where: { id },
        include: { translations: true },
    });
}

export async function getFlatRateById(id: string) {
    const flatrate = await prisma.flatRate.findUnique({
        where: { id },
        include: { translations: true },
    });

    if (!flatrate) {
        throw new AppException("Flat rate not found!", 404, "FLAT_RATE_NOT_FOUND");
    }

    return flatrate;
}

/* ========== Mutations ========== */

export async function createFlatRate(input: CreateFlatrateInput) {
    const { total_cents, translations } = input;

    return prisma.flatRate.create({
        data: {
            total_cents,
            translations: { create: translations },
        },
        include: { translations: true },
    });
}

export async function updateFlatRate(id: string, input: UpdateFlatrateInput) {
    const { total_cents, translations } = input;

    const flatrate = await prisma.flatRate.update({
        where: { id },
        data: {
            ...(total_cents !== undefined ? { total_cents } : {}),
            ...(Array.isArray(translations)
                ? {
                    translations: {
                        upsert: translations.map((t) => ({
                            where: { flatRateId_language: { flatRateId: id, language: t.language } },
                            create: { language: t.language, name: t.name, table: t.table },
                            update: { name: t.name, table: t.table },
                        })),
                    },
                }
                : {}),
        },
        include: { translations: true },
    });

    return flatrate;
}

/* ========== Deletes ========== */

export async function deleteFlatRate(id: string): Promise<void> {
    if (!id) {
        throw new AppException("Bad request. Missing id!", 400, "MISSING_ID");
    }

    await prisma.flatRate.findUniqueOrThrow({ where: { id } });
    await prisma.flatRate.delete({ where: { id } });
}
