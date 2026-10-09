import { OfferDerivationType } from "@prisma/client";
import { ExtendOfferInput, PositionPrice } from '@keepit/schemas';

import { prisma } from "@/core/prisma.js";
import { AppException } from "@/core/exceptions.js";
import { type PricedPosition, priceFromPin } from "./offer-pricing.js";
import { persistOffer } from "./offer-write.js";

/** Lädt eine Quellposition und stellt sicher, dass sie zum Angebot gehört. */
async function loadSourcePosition(offerId: string, positionId: string) {
    const position = await prisma.offerPosition.findUnique({
        where: { id: positionId },
        select: {
            id: true, offerId: true, productId: true,
            free_months: true, eur_user_month: true, tariffVersionId: true,
        },
    });

    if (!position || position.offerId !== offerId) {
        throw new AppException("Offer position not found", 422, "OFFER_POSITION_NOT_FOUND");
    }

    return position;
}

/** Preis-Vorschau für eine einzelne Erweiterungsposition (Anzeige im Modal). */
export async function getExtensionPrice(
    offerId: string,
    positionId: string,
    quantity: number,
): Promise<PositionPrice> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppException("quantity muss eine positive Ganzzahl sein.", 400, "INVALID_INPUT");
    }

    const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        select: { customerId: true, duration_months: true },
    });

    if (!offer) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const source = await loadSourcePosition(offerId, positionId);
    const { eur_user_month, total_cents, discount_cents, fromSnapshot, origin, list_eur_user_month } =
        await priceFromPin(source, offer.duration_months, quantity, offer.customerId);

    return { eur_user_month, total_cents, discount_cents, fromSnapshot, origin, list_eur_user_month };
}

/**
 * Erzeugt eine Lizenzerweiterung: zusätzliche Seats innerhalb eines laufenden
 * Vertrags, abgerechnet zu den Konditionen des Quellangebots.
 *
 * Produkt, Vertrag und Laufzeit stammen unverändert aus der Quellposition, nur
 * die Menge darf abweichen. Flatrates entfallen bewusst — sie sind vertragsweite
 * Pauschalen und wären in einer Nachbestellung eine Doppelfakturierung.
 */
export async function extendOffer(sourceOfferId: string, input: ExtendOfferInput, actorId: string | null) {
    const source = await prisma.offer.findUnique({
        where: { id: sourceOfferId },
        include: { offerPositions: true },
    });

    if (!source) {
        throw new AppException("Offer not found", 404, "OFFER_NOT_FOUND");
    }

    const sourceById = new Map(source.offerPositions.map((position) => [position.id, position]));
    const positions: PricedPosition[] = [];

    for (const requested of input.positions) {
        const sourcePosition = sourceById.get(requested.sourcePositionId);

        if (!sourcePosition) {
            throw new AppException(
                `Position ${requested.sourcePositionId} gehört nicht zum Quellangebot.`,
                422,
                "OFFER_POSITION_NOT_FOUND",
            );
        }

        const priced = await priceFromPin(
            sourcePosition, source.duration_months, requested.quantity, source.customerId,
        );

        positions.push({
            productId: sourcePosition.productId,
            free_months: sourcePosition.free_months,
            quantity: requested.quantity,
            optional: sourcePosition.optional,
            total_cents: priced.total_cents,
            eur_user_month: priced.eur_user_month,
            discount_cents: priced.discount_cents,
            // Der Pin wird weitergereicht, damit auch die Erweiterung einer
            // Erweiterung noch auf derselben Preisgrundlage steht.
            tariffVersionId: priced.tariffVersionId,
        });
    }

    return persistOffer(
        {
            // Vertrag und Laufzeit werden unveraendert uebernommen: eine
            // Erweiterung laeuft innerhalb des bestehenden Vertrags. Sie wird
            // bewusst *nicht* gegen die Standardlaufzeiten geprueft — sonst
            // liessen sich laufende Vertraege nicht mehr erweitern, sobald ihre
            // Laufzeit aus der Liste genommen wird.
            contractId: source.contractId,
            duration_months: source.duration_months,
            customerId: source.customerId,
            contactPersonId: source.contactPersonId,
            userId: source.userId,
            supplierId: source.supplierId,
            quoteId: input.quoteId,
            paymentTerm: source.paymentTerm,
            language: source.language,
            validFrom: input.validFrom,
            validUntil: input.validUntil,
            requestFrom: input.requestFrom,
            featureComparison: source.featureComparison,
            toCompare: source.toCompare,
        },
        positions,
        [],
        input.discounts,
        {
            renewedFromOfferId: sourceOfferId,
            derivationType: OfferDerivationType.LICENSE_EXTENSION,
        },
    );
}
