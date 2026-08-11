import { AppException } from "@/lib/exceptions.js";
import { prisma } from "@/lib/prismaClient.js";
import { calculatePrice, loadTariffForPricing, PriceFailureReason, resolveCell } from "@/utils/products.js";
import { CalculatedPositionPriceResult, DeleteOverrideInput, LivePriceQuery, PinnedPriceQuery, PositionPrice, UpsertOverrideInput } from "@keepit/schemas";
import { recalculateAfterOverrideChange } from "./tariff.service.js";
import { calculatePinnedPrice } from "@/utils/pricing/pinned.pricing.js";
import { selectPrice } from "@/utils/pricing/live.pricing.js";

const PRICE_FAILURE: Record<Exclude<PriceFailureReason, 'INVALID_INPUT'>, { status: number; message: string }> = {
    NO_TARIFF: { status: 404, message: "Tariff für das Produkt/den Vertrag wurde nicht gefunden." },
    NO_CELL: { status: 404, message: "Keine Zelle für die gewählte Zeile/Spalte konfiguriert." },
    NO_DEFAULT: { status: 404, message: "Kein Default-Preis für die Zelle hinterlegt." },
    NO_COLUMN: { status: 422, message: "Laufzeit ist in keiner Tariff-Spalte konfiguriert." },
    NO_ROW: { status: 422, message: "Menge liegt außerhalb aller konfigurierten Mengenbereiche." },
};

const priceFailure = (reason: Exclude<PriceFailureReason, 'INVALID_INPUT'>) =>
    new AppException(PRICE_FAILURE[reason].message, PRICE_FAILURE[reason].status, reason);

export async function getLivePrice(query: LivePriceQuery) {
    if (query.free_months > query.duration) {
        throw new AppException("free_months > duration", 500, "FREE_MONTHS_GREATED_DURATION");
    }

    const result = await calculatePrice(query);

    if (!result.ok) {
        if (result.reason === "INVALID_INPUT") {
            throw new AppException("invalid getLivePrice input!", 400, result.reason);
        }

        throw new AppException(result.reason, 500, result.reason);
    }

    const tariffGroup = await prisma.tariffGroupProduct.findUnique({
        where: { productId: query.productId },
        select: { tariffGroupId: true }
    });

    if (!tariffGroup) {
        throw new AppException("", 404, "");
    }

    const tariff = await prisma.tariff.findUnique({
        where: {
            tariffGroupId_contractId: {
                tariffGroupId: tariffGroup.tariffGroupId,
                contractId: query.contractId,
            }
        },
        include: {
            columns: true,
            rows: true,
            cells: {
                include: {
                    default_cells: true
                }
            },
            customerPrices: true,
        }
    })

    if (!tariff) {
        throw new AppException("", 404, "");
    }

    const selected = selectPrice({
        tariff: tariff,
        customerId: query.customerId,
        productId: query.productId,
        duration: query.duration,
        quantity: query.quantity,
        free_months: query.free_months,
    });

    return selected;
}

export async function getPinnedPrice(query: PinnedPriceQuery): Promise<CalculatedPositionPriceResult> {
    if (query.free_months && query.free_months > query.duration) {
        throw new AppException("", 500, "FREE_MONTHS_GREATE_DURATION");
    }

    const position = await prisma.offerPosition.findFirstOrThrow({
        where: { id: query.positionId },
    });

    const result = await calculatePinnedPrice({
        customerId: query.customerId,
        position: position,

        duration: query.duration,
        quantity: query.quantity,
        free_months: query.free_months,
    });

    return result;
}

export async function upsertOverride(query: UpsertOverrideInput): Promise<PositionPrice> {
    const { productId, contractId, duration, quantity, customerId, price } = query;

    const tariff = await loadTariffForPricing(productId, contractId, customerId);
    if (!tariff) throw priceFailure("NO_TARIFF");

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) throw priceFailure(resolved.reason);

    await prisma.tariffCustomerPrice.upsert({
        where: {
            tariffId_customerId_productId_duration_min_quantity: {
                tariffId: tariff.id,
                customerId,
                productId,
                duration: resolved.column.duration,
                min_quantity: resolved.row.min_quantity,
            },
        },
        create: {
            tariffId: tariff.id,
            customerId,
            productId,
            duration: resolved.column.duration,
            min_quantity: resolved.row.min_quantity,
            price,
        },
        update: { price },
    });

    return recalculateAfterOverrideChange(
        { productId, contractId, duration, quantity, customerId },
        "Override gespeichert, aber Preis konnte nicht neu berechnet werden.",
    );
}

export async function deleteOverride(query: DeleteOverrideInput): Promise<PositionPrice> {
    const { productId, contractId, duration, quantity, customerId } = query;

    const tariff = await loadTariffForPricing(productId, contractId, customerId);
    if (!tariff) throw priceFailure("NO_TARIFF");

    const resolved = resolveCell(tariff, { duration, quantity });
    if (!resolved.ok) throw priceFailure(resolved.reason);

    await prisma.tariffCustomerPrice.deleteMany({
        where: {
            tariffId: tariff.id,
            customerId,
            productId,
            duration: resolved.column.duration,
            min_quantity: resolved.row.min_quantity,
        },
    });

    return recalculateAfterOverrideChange(
        { productId, contractId, duration, quantity, customerId },
        "Override gelöscht, aber Default-Preis konnte nicht berechnet werden.",
    );
}


