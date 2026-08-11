import { AppException } from "@/lib/exceptions.js";
import { prisma } from "@/lib/prismaClient.js";
import { tariffFromSnapshot, parseTariffVersionSnapshot } from "@/schemas/tariff-version-schema.js";
import { CalculatedPositionPriceResult } from "@keepit/schemas";
import { OfferPosition } from "@prisma/client";
import { selectPrice } from "./live.pricing.js";

interface PinnedProps {
    customerId: string;
    position: OfferPosition;

    duration?: number;
    quantity?: number;
    free_months?: number;
}

export async function calculatePinnedPrice({ customerId, position, duration, quantity, free_months }: PinnedProps): Promise<CalculatedPositionPriceResult> {
    if (!position.tariffVersionId) {
        throw new AppException("tariffVersionId in position not found!", 404, "TARIFF_VERSION_ID_NOT_FOUND")
    }

    const version = await prisma.tariffVersion.findUnique({
        where: { id: position.tariffVersionId },
        select: {
            tariffId: true,
            snapshot: true,
            snapshotVersion: true,
        }
    });

    console.dir(version, { depth: null })

    if (!version) {
        throw new AppException("Tariff version not found", 404, "TARIFF_VERSION_NOT_FOUND");
    }

    if (version.snapshotVersion !== 1) {
        throw new AppException(`Snapshot-Version ${version.snapshotVersion} wird nicht unterstützt.`, 422, "UNSUPPORTED_SNAPSHOT_VERSION");
    }

    const customerOverride = await prisma.tariffCustomerPrice.findMany({
        where: { tariffId: version.tariffId, customerId },
    });

    const tariff = tariffFromSnapshot(parseTariffVersionSnapshot(version.snapshot), customerOverride);

    console.dir(tariff, { depth: null })

    const result = selectPrice({
        tariff: tariff,
        customerId: customerId,
        productId: position.productId,

        duration: duration ?? position.duration,
        quantity: quantity ?? position.quantity,
        free_months: free_months ?? 0,
    });

    console.log(result)

    if (!result.ok) {
        throw new AppException(
            `Price calculation failed for product ${position.productId}: ${result.reason}`,
            422,
            "PRICE_CALCULATION_FAILED",
        );
    }

    return {
        ok: result.ok,
        unit: result.unit,
        discount: result.discount,
        price: result.total,
        discountedPrice: result.totalDiscounted,
    }
}