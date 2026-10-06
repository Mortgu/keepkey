import { Prisma, TariffVersionReason } from "@prisma/client";

import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import { loadTariffForPricing, selectPrice } from "../../utils/products.js";
import { sealTariffVersion } from "../tariff.service.js";

import {
    CreateOfferPositionInput,
    CreateOfferFlatrateInput,
} from '@keepit/schemas';

import {
    parseTariffVersionSnapshot,
    tariffFromSnapshot,
} from "../../schemas/tariff-version-schema.js";

/* ========== Types ========== */

export type PricedPosition = CreateOfferPositionInput & {
    total_cents: number;
    eur_user_month: number;
    discount_cents: number;
    /** Angepinnte, unveränderliche Preisgrundlage dieser Position. */
    tariffVersionId: string | null;
};

/**
 * Vertrag und Laufzeit des Angebots. Sie adressieren zusammen mit Produkt und
 * Menge eine Zelle der Preistabelle — und stehen am Kopf, weil alle Positionen
 * eines Angebots dieselbe Spalte derselben Tabelle treffen.
 */
export type PriceHeader = {
    contractId: string;
    duration_months: number;
};
export type PricedFlatrate = CreateOfferFlatrateInput & { total_cents: number };
export type PricedDiscount = {
    title: string;
    description?: string | null;
    amount_cents: number;
};

/**
 * Nettobetrag eines Angebots: Positionen abzüglich Freimonate, zuzüglich
 * Flatrates, abzüglich Rabatte.
 */
export function calculateNetAmount(
    positions: ReadonlyArray<Pick<PricedPosition, "total_cents" | "discount_cents">>,
    flatrates: ReadonlyArray<Pick<PricedFlatrate, "total_cents">>,
    discounts: ReadonlyArray<Pick<PricedDiscount, "amount_cents">>,
): number {
    return positions.reduce((sum, p) => sum + p.total_cents - p.discount_cents, 0) +
        flatrates.reduce((sum, f) => sum + f.total_cents, 0) -
        discounts.reduce((sum, d) => sum + d.amount_cents, 0);
}

/**
 * Berechnet total_cents für jede Position über den Tarif (wirft AppException,
 * wenn kein Preis ermittelbar).
 *
 * Dabei wird der verwendete Tarifstand als unveränderliche `TariffVersion`
 * versiegelt und an der Position angepinnt. Der Hash-Vergleich in
 * {@link sealTariffVersion} sorgt dafür, dass unveränderte Tabellen keine neue
 * Version erzeugen — es entsteht genau eine Version je tatsächlich verkaufter
 * Konfiguration.
 *
 * Läuft der Aufrufer bereits in einer Transaktion, muss er sie als `db`
 * hereinreichen: Sonst öffnet {@link sealTariffVersion} je Position eine
 * eigene, unabhängige Transaktion, während die äußere eine Verbindung hält —
 * bei parallelen Bearbeitungen läuft so der Pool leer.
 */
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

            const version = await sealTariffVersion(tariff.id, TariffVersionReason.OFFER, actorId, db);

            const eur_user_month = result.breakdown.unitPrice;
            const discount_cents = eur_user_month * position.quantity * (position.free_months ?? 0);

            priced.push({
                ...position,
                total_cents: result.price,
                eur_user_month,
                discount_cents,
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

/** Lädt die total_cents aller angefragten FlatRates als Map (id → cents). */
async function getFlatRateCentsById(
    flatRateIds: string[],
    db: Prisma.TransactionClient,
): Promise<Map<string, number>> {
    const rates = await db.flatRate.findMany({
        where: { id: { in: flatRateIds } },
        select: { id: true, total_cents: true },
    });

    return new Map(rates.map((r) => [r.id, r.total_cents]));
}

/** Berechnet total_cents (= rate * quantity) für jede Flatrate. */
export async function priceFlatrates(
    flatrates: CreateOfferFlatrateInput[],
    db: Prisma.TransactionClient = prisma,
): Promise<PricedFlatrate[]> {
    const rateById = await getFlatRateCentsById(flatrates.map((f) => f.flatRateId), db);

    return flatrates.map((flatrate) => {
        const rate_cents = rateById.get(flatrate.flatRateId);
        if (rate_cents === undefined) {
            throw new AppException(`FlatRate ${flatrate.flatRateId} not found!`, 404, "FLAT_RATE_NOT_FOUND");
        }

        return { ...flatrate, total_cents: rate_cents * flatrate.quantity };
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
    free_months: number;
    eur_user_month: number;
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
    const flat = (eur_user_month: number, fromSnapshot: boolean) => ({
        eur_user_month,
        total_cents: eur_user_month * quantity * duration,
        discount_cents: eur_user_month * quantity * source.free_months,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot,
        origin: "list" as const,
        list_eur_user_month: null,
    });

    if (!source.tariffVersionId) {
        return flat(source.eur_user_month, false);
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

    const customerPrices = await prisma.tariffCustomerPrice.findMany({
        where: { tariffId: version.tariffId, customerId },
    });

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

    const eur_user_month = result.breakdown.unitPrice;

    return {
        eur_user_month,
        total_cents: result.price,
        discount_cents: eur_user_month * quantity * source.free_months,
        tariffVersionId: source.tariffVersionId,
        fromSnapshot: true,
        // Der Kundenpreis wird aktuell gelesen, nicht aus dem Snapshot — die
        // Herkunft gilt also für heute und ist deshalb aussagekräftig.
        origin: result.breakdown.origin,
        list_eur_user_month: result.breakdown.listUnitPrice,
    };
}
