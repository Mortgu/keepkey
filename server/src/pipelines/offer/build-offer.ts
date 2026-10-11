import { parseAcceptedOfferSnapshot, parseAcceptedOfferTemplate } from "../../schemas/accepted-offer.js";

import { prisma } from "@/lib/prismaClient.js";
import { contractOrderBy } from "@/services/contract.service.js";
import { OfferTemplate, offerTemplateSchema } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation } from "@/utils/i18n.js";
import logger from "@/utils/logger.js";
import type { Language } from "@prisma/client";
import { z } from "zod";
import { computeOfferModel } from "./compute-offer.js";
import { presentOffer, withNumberPrefixes } from "./present-offer.js";

export const fetchOfferData = async (offerId: string) => {
    const [offer, contracts] = await Promise.all([
        await prisma.offer.findUniqueOrThrow({
            where: { id: offerId },
            include: {
                customer: true,
                customerContactPerson: true,
                user: true,
                contract: { include: { translations: true } },
                offerPositions: {
                    include: {
                        product: { include: { translations: true } },
                    },
                },
                offerFlatRates: {
                    include: {
                        flatRate: { include: { translations: true } },
                    },
                },
                offerDiscounts: true,
            }
        }),

        await prisma.contract.findMany({
            include: {
                translations: true,
            },
            orderBy: contractOrderBy,
        }),
    ]);

    if (offer.acceptedSnapshot) {
        const s = parseAcceptedOfferSnapshot(offer.acceptedSnapshot);
        // No current master data enters an accepted document's commercial content.
        offer.customer = { ...offer.customer, ...s.customer };
        offer.customerContactPerson = { ...offer.customerContactPerson, ...s.customerContactPerson };
        offer.user = { ...offer.user, ...s.employee };
        offer.language = s.language;
        offer.contract = { ...offer.contract, translations: s.contract.translations.map(t => ({
            ...t, contractId: s.contract.id, createdAt: s.contract.createdAt, updatedAt: s.contract.updatedAt,
        })) };
        offer.offerPositions = s.positions.map(p => ({
            ...p, offerId: offer.id, tariffVersionId: p.tariffVersionId ?? null, updatedAt: p.createdAt,
            product: { ...p.product, translations: p.product.translations.map(t => ({
                ...t, productId: p.productId, description: t.description ?? null, table: t.table ?? null,
            })) },
        }));
        offer.offerFlatRates = s.flatRates.map(f => ({ ...f, offerId: offer.id,
            flatRate: { ...f.flatRate, translations: f.flatRate.translations.map(t => ({
                ...t, flatRateId: f.flatRateId, table: t.table ?? "",
            })) },
        }));
    }
    return { offer, contracts };
}

export type OfferFetchData = Awaited<ReturnType<typeof fetchOfferData>>;

/** Rechnen, dann darstellen — die zwei Schritte stehen in `compute-offer` und `present-offer`. */
export const formatOfferData = async (fetchedData: OfferFetchData): Promise<OfferTemplate> =>
    presentOffer(await computeOfferModel(fetchedData));

/**
 * Alles, was die Angebotsvorlage braucht — eine Funktion, von oben nach unten:
 * Angebot laden, formatieren (bei angenommenen Angeboten aus dem Snapshot),
 * gegen das Schema prüfen, Namen bilden.
 *
 * `version` kommt vom `OfferDocument` und steht im Dateinamen, sobald es eine
 * Neufassung ist.
 */
export async function buildOffer(offerId: string, version: number): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const fetched = await fetchOfferData(offerId);
    const { offer } = fetched;

    let data: OfferTemplate;
    try {
        // Auch für den eingefrorenen Snapshot: der kennt die Nummern noch nicht.
        data = withNumberPrefixes(offerTemplateSchema.parse(
            offer.acceptedSnapshot
                ? parseAcceptedOfferTemplate(offer.acceptedSnapshot)
                : await formatOfferData(fetched),
        ));
    } catch (exception) {
        if (exception instanceof z.ZodError) {
            logger.error('offer_template_validation_failed', { offerId, issues: exception.issues });
        }
        throw exception;
    }

    const company = offer.customer.companyName.replaceAll(" ", "").trim();
    const workloads = offer.offerPositions
        .map((op) => (pickTranslation(op.product.translations, offer.language)?.name ?? "").replaceAll(" ", "").trim())
        .join("+");

    return {
        data,
        language: offer.language,
        displayName: `${offer.quoteId}_AG_${company}_Keepit-${workloads}${version > 0 ? `_v${version}` : ''}`,
    };
}
