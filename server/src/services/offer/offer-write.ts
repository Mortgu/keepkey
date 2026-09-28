import { OfferDerivationType, Prisma } from "@prisma/client";

import { prisma } from "../../lib/prismaClient.js";
import { AppException } from "../../lib/exceptions.js";
import {
    OFFER_REVISION_SNAPSHOT_VERSION,
    buildOfferRevisionSnapshot,
} from "../../schemas/revision-schemas.js";
import {
    calculateNetAmount,
    type PricedDiscount,
    type PricedFlatrate,
    type PricedPosition,
    type PriceHeader,
} from "./offer-pricing.js";

/** Alles, was eine Revision festhält: Kopf plus Positionen, Flatrates und Rabatte. */
export const offerLinesInclude = {
    offerPositions: true,
    offerFlatRates: true,
    offerDiscounts: true,
} as const;

type OfferWithLines = Prisma.OfferGetPayload<{ include: typeof offerLinesInclude }>;

/** Optimistisches Locking: Änderungen nur auf dem Stand, den der Client kennt. */
export function assertExpectedVersion(current: { version: number }, expectedVersion: number): void {
    if (current.version !== expectedVersion) {
        throw new AppException(
            "The offer was changed by another user. Reload it and try again.",
            409,
            "VERSION_CONFLICT",
        );
    }
}

/** Sichert den aktuellen Stand als Revision, bevor er überschrieben wird. */
export async function recordRevision(tx: Prisma.TransactionClient, current: OfferWithLines, actorId: string): Promise<void> {
    const snapshot = buildOfferRevisionSnapshot(current as unknown as Record<string, unknown>);

    await tx.offerRevision.create({
        data: {
            offerId: current.id,
            version: current.version,
            changedById: actorId,
            snapshotVersion: OFFER_REVISION_SNAPSHOT_VERSION,
            snapshot: snapshot as Prisma.InputJsonValue,
        },
    });
}

/** Ersetzt Positionen, Flatrates und Rabatte eines bestehenden Angebots. */
export async function replaceOfferLines(
    tx: Prisma.TransactionClient,
    offerId: string,
    lines: {
        positions: PricedPosition[];
        flatRates: PricedFlatrate[];
        discounts: ReadonlyArray<PricedDiscount>;
    },
): Promise<void> {
    await replacePositions(tx, offerId, lines.positions);
    await replaceFlatRates(tx, offerId, lines.flatRates);
    await replaceDiscounts(tx, offerId, lines.discounts);
}

/** Nach einer inhaltlichen Änderung passt kein bisher erzeugtes Dokument mehr. */
export async function invalidateCurrentDocuments(tx: Prisma.TransactionClient, offerId: string): Promise<void> {
    await tx.offerDocument.updateMany({
        where: { offerId, isCurrent: true },
        data: { isCurrent: false },
    });
}

async function replacePositions(tx: Prisma.TransactionClient, offerId: string, positions: PricedPosition[]) {
    await tx.offerPosition.deleteMany({ where: { offerId } });
    await tx.offerPosition.createMany({
        data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
            offerId, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
            tariffVersionId: tariffVersionId ?? null,
        })),
    });
}

async function replaceFlatRates(tx: Prisma.TransactionClient, offerId: string, flatRates: PricedFlatrate[]) {
    await tx.offerFlatRate.deleteMany({ where: { offerId } });
    await tx.offerFlatRate.createMany({
        data: flatRates.map(({ flatRateId, quantity, total_cents }) => ({
            offerId, flatRateId, quantity, total_cents,
        })),
    });
}

async function replaceDiscounts(tx: Prisma.TransactionClient, offerId: string, discounts: ReadonlyArray<PricedDiscount>) {
    await tx.offerDiscount.deleteMany({ where: { offerId } });
    if (discounts.length === 0) return;

    await tx.offerDiscount.createMany({
        data: discounts.map(({ title, description, amount_cents }) => ({
            offerId, title, description: description ?? null, amount_cents,
        })),
    });
}

/** Skalarfelder eines Angebots — alles ausser Positionen, Flatrates und Rabatten. */
export type OfferFields = PriceHeader & {
    customerId: string;
    contactPersonId: string;
    userId: string;
    supplierId: string | null;
    quoteId: string;
    paymentTerm: string;
    language: "DE" | "EN";
    validUntil: string | null;
    requestFrom: string | null;
    featureComparison: boolean;
    toCompare: string[];
};

/**
 * Schreibt ein Angebot mit bereits bepreisten Bestandteilen.
 *
 * Bewusst von der Preisermittlung getrennt: `createOffer` bepreist über den
 * Live-Tarif, `extendOffer` über die angepinnte Tarif-Version — die Persistenz
 * inklusive `net_amount`-Formel ist für beide dieselbe.
 */
export async function persistOffer(
    fields: OfferFields,
    positions: PricedPosition[],
    flatrates: PricedFlatrate[],
    discounts: ReadonlyArray<PricedDiscount>,
    options?: { renewedFromOfferId?: string; derivationType?: OfferDerivationType },
) {
    return prisma.$transaction(async (tx) => {
        const net_amount = calculateNetAmount(positions, flatrates, discounts);

        const offer = await tx.offer.create({
            data: {
                ...fields,
                net_amount,
                renewedFromOfferId: options?.renewedFromOfferId ?? null,
                derivationType: options?.derivationType ?? null,
            },
        });

        await tx.offerPosition.createMany({
            data: positions.map(({ productId, free_months, quantity, optional, eur_user_month, total_cents, discount_cents, tariffVersionId }) => ({
                offerId: offer.id, productId, free_months, quantity, eur_user_month, total_cents, discount_cents, optional,
                tariffVersionId,
            })),
        });

        if (flatrates.length > 0) {
            await tx.offerFlatRate.createMany({
                data: flatrates.map(({ flatRateId, quantity, total_cents }) => ({
                    offerId: offer.id, flatRateId, quantity, total_cents,
                })),
            });
        }

        await replaceDiscounts(tx, offer.id, discounts);

        return offer;
    });
}
