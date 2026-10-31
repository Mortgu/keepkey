import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prismaClient.js";
import { AppException } from "@/lib/exceptions.js";
import { loadTariffForPricing, selectPrice } from "@/utils/products.js";
import { sealTariffVersion } from "../tariff.service.js";

import {
    CreateOfferPositionInput,
    CreateOfferFlatrateInput,
} from '@keepit/schemas';

import {
    parseTariffVersionSnapshot,
    tariffFromSnapshot,
} from "@/schemas/tariff-version-schema.js";

/* ========== Types ========== */

export type PricedPosition = CreateOfferPositionInput & {
    totalCents: number;
    unitCents: number;
    discountCents: number;
    tariffVersionId: string | null;
};

export type PriceHeader = {
    contractId: string;
    duration_months: number;
};

export type PricedFlatRate = CreateOfferFlatrateInput & { totalCents: number };

export type PricedDiscount = {
    title: string;
    description?: string | null;
    totalCents: number;
};

export function calculateNetAmount(
    positions: ReadonlyArray<Pick<PricedPosition, "totalCents" | "discountCents">>,
    flatRates: ReadonlyArray<Pick<PricedFlatRate, "totalCents">>,
    discounts: ReadonlyArray<Pick<PricedDiscount, "totalCents">>,
): number {
    return positions.reduce((sum, p) => sum + p.totalCents - p.discountCents, 0) +
        flatRates.reduce((sum, f) => sum + f.totalCents, 0) -
        discounts.reduce((sum, d) => sum + d.totalCents, 0);
}

export async function pricePositions(
    positions: CreateOfferPositionInput[],
    header: PriceHeader,
    customerId: string | undefined,
    actorId: string | null,
    db: Prisma.TransactionClient = prisma,
): Promise<PricedPosition[]> {
    const priced: PricedPosition[] = [];

    for (const position of positions) {
        try {
            const tariff = await loadTariffForPricing(position.productId, header.contractId, customerId, db);

            if (!tariff) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: NO_TARIFF`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const result = selectPrice(tariff, {
                productId: position.productId,
                duration: header.duration_months,
                quantity: position.quantity,
                customerId,
            });

            if (!result.ok) {
                throw new AppException(
                    `Price calculation failed for product ${position.productId}: ${result.reason}`,
                    422,
                    "PRICE_CALCULATION_FAILED",
                );
            }

            const version = await sealTariffVersion(tariff.id, actorId, db);

            const unitCents = result.breakdown.unitPrice;
            const discountCents = unitCents * position.quantity * (position.freeMonths ?? 0);

            priced.push({
                ...position,
                totalCents: result.price,
                unitCents,
                discountCents,
                tariffVersionId: version.id,
            });
        } catch (exception: any) {
            if (exception instanceof AppException) throw exception;
            throw new AppException(
                `Price calculation failed for product ${position.productId}: ${exception.message}`,
                422,
                "PRICE_CALCULATION_FAILED",
            );
        }
    }

    return priced;
}

/** Lädt die totalCents aller angefragten FlatRates als Map (id → cents). */
async function getFlatRateCentsById(
    flatRateIds: string[],
    db: Prisma.TransactionClient,
): Promise<Map<string, number>> {
    const rates = await db.flatRate.findMany({
        where: { id: { in: flatRateIds } },
        select: { id: true, totalCents: true },
    });

    return new Map(rates.map((r) => [r.id, r.totalCents]));
}

/** Berechnet totalCents (= rate * quantity) für jede Flatrate. */
export async function priceFlatrates(
    flatrates: CreateOfferFlatrateInput[],
    db: Prisma.TransactionClient = prisma,
): Promise<PricedFlatRate[]> {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId), db);

    return flatrates.map((flatrate) => {
        const rate_cents = rateById.get(flatrate.flatRateId);
        if (rate_cents === undefined) {
            throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
        }

        return { ...flatrate, totalCents: rate_cents * flatrate.quantity };
    });
}

/**
 * Quellposition in der Form, die {@link priceFromPin} benötigt.
 *
 * Die Laufzeit steht nicht mehr an der Position, sondern am Quellangebot —
 * sie wird deshalb getrennt hereingereicht.
 */
export type SourcePosition = {
    id: string;
    productId: string;
    freeMonths: number;
    unitCents: number;
    tariffVersionId: string | null;
};

/**
 * Ermittelt den Preis einer Erweiterungsposition aus der Tarif-Version, die die
 * Quellposition angepinnt hat. Dadurch gilt der Preis von damals, obwohl der
 * Live-Tarif inzwischen ein anderer sein kann — und weil die volle Preistabelle
 * eingefroren ist, greift auch bei geänderter Menge die richtige Staffel.
 *
 * Kundenspezifische Preise werden bewusst **aktuell** gelesen: Sie haben keine
 * Historie, ein ausgehandelter Sonderpreis gilt also in seiner heutigen Fassung.
 *
 * Ohne Pin (Positionen aus der Zeit vor der Tarif-Versionierung) bleibt nur der
 * flache Rückfall auf den gespeicherten Stückpreis — Mengenstaffeln lassen sich
 * dann nicht berücksichtigen, was `fromSnapshot: false` nach aussen meldet. Ob
 * jener Betrag damals ein Kundenpreis war, ist an der Position nicht vermerkt;
 * er wird deshalb als `list` ohne Vergleichswert gemeldet.
 */
export async function priceFromPin(
    source: SourcePosition,
    duration: number,
    quantity: number,
    customerId: string,
) {
    const flat = (unitCents: number, fromSnapshot: boolean) => ({
        unitCents,
        totalCents: unitCents * quantity * duration,
        discountCents: unitCents * quantity * source.freeMonths,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot,
        origin: "list" as const,
        list_eur_user_month: null,
    });

    if (!source.tariffVersionId) {
        return flat(source.unitCents, false);
    }

    const version = await prisma.tariffVersion.findUnique({
        where: { id: source.tariffVersionId },
        select: { tariffId: true, snapshot: true, snapshotVersion: true },
    });

    if (!version) {
        throw new AppException("Tariff version not found", 404, "TARIFF_VERSION_NOT_FOUND");
    }

    if (version.snapshotVersion !== 1) {
        throw new AppException(
            `Snapshot-Version ${version.snapshotVersion} wird nicht unterstützt.`,
            422,
            "UNSUPPORTED_SNAPSHOT_VERSION",
        );
    }

    // Ist die Preistabelle inzwischen entfernt, gibt es keine Kundenpreise mehr;
    // die eingefrorene Staffel gilt weiter.
    const customerPrices = version.tariffId
        ? await prisma.tariffCustomerPrice.findMany({ where: { tariffId: version.tariffId, customerId } })
        : [];

    const tariff = tariffFromSnapshot(parseTariffVersionSnapshot(version.snapshot), customerPrices);

    const result = selectPrice(tariff, {
        productId: source.productId,
        duration,
        quantity,
        customerId,
    });

    if (!result.ok) {
        throw new AppException(
            `Price calculation failed for product ${source.productId}: ${result.reason}`,
            422,
            "PRICE_CALCULATION_FAILED",
        );
    }

    const unitCents = result.breakdown.unitPrice;

    return {
        unitCents,
        totalCents: result.price,
        discountCents: unitCents * quantity * source.freeMonths,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot: true,
        // Der Kundenpreis wird aktuell gelesen, nicht aus dem Snapshot — die
        // Herkunft gilt also für heute und ist deshalb aussagekräftig.
        origin: result.breakdown.origin,
        list_eur_user_month: result.breakdown.listUnitPrice,
    };
}
