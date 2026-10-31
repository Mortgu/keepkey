import { netCents } from "@keepit/schemas";
import { calculatePrice } from "@/utils/products.js";
import type { OfferFetchData } from "./build-offer.js";
import type { ContractModel, OfferModel, PositionAmounts, PositionModel, PriceTableModel } from "./offer-model.js";

/**
 * Preis einer Position so, wie er beim Anlegen des Angebots festgeschrieben
 * wurde.
 *
 * Das Angebot ist die Quelle der Wahrheit, nicht der heutige Tarif: ein einmal
 * verschicktes Dokument muss bei jeder erneuten Erzeugung dieselben Zahlen
 * zeigen, auch wenn die Preistabelle inzwischen eine andere ist.
 */
const storedPrice = (position: PositionAmounts): PositionAmounts => ({
    eur_user_month: position.eur_user_month,
    total_cents: position.total_cents,
    discount_cents: position.discount_cents,
});

/**
 * Preis aus einer frischen Tarif-Berechnung — für die Vergleichstabellen.
 *
 * Nur dort richtig: diese Positionen hat es unter dem anderen Vertrag nie
 * gegeben, es gibt also keinen gespeicherten Wert, der gelten könnte.
 *
 * Die Aufteilung ist dieselbe wie beim Speichern einer Position
 * (`pricePositions` in offer.service): `total_cents` brutto über die volle
 * Laufzeit, die Freimonate getrennt in `discount_cents`. Die Laufzeit kommt vom
 * Angebot, nicht von der Position — sie gilt für alle Positionen gemeinsam.
 */
const livePrice = (
    unitPrice: number,
    position: { quantity: number; free_months: number },
    duration_months: number,
): PositionAmounts => ({
    eur_user_month: unitPrice,
    total_cents: unitPrice * position.quantity * duration_months,
    discount_cents: unitPrice * position.quantity * position.free_months,
});

const iso = (date: Date | string | null | undefined): string | null =>
    date === null || date === undefined ? null : new Date(date).toISOString();

const toContract = (contract: OfferFetchData["contracts"][number]): ContractModel => ({
    id: contract.id,
    translations: contract.translations.map((t) => ({ language: t.language, name: t.name, features: t.features })),
});

/**
 * Rechnet aus den geladenen Daten das Angebotsmodell: Positionen, Summen und
 * die Preistabellen. Nichts davon ist formatiert — das macht `presentOffer`.
 *
 * Die Haupttabelle nutzt die festgeschriebenen Preise der Positionen. Die
 * Vergleichstabellen anderer Verträge werden live berechnet; fehlt dafür
 * irgendwo eine Preistabelle, entfällt die Tabelle — ein Vergleich ist
 * optionales Beiwerk und darf die Erzeugung des Angebots nicht scheitern
 * lassen.
 *
 * Flatrates und Rabatte gelten für das gesamte Angebot und gehen in jede
 * Tabellensumme ein: die Vergleichsvarianten sind vollständige Alternativen.
 * Die Summe ist netto — im Dokument steht über ihr der Bruttopreis und
 * darunter der Rabatt als eigene Zeile.
 */
export async function computeOfferModel({ offer, contracts }: OfferFetchData): Promise<OfferModel> {
    // Vertrag und Laufzeit stehen am Angebot; die frühere Gruppierung nach
    // `contractId_duration_months` konnte deshalb entfallen.
    const duration_months = offer.duration_months;

    const positions: PositionModel[] = offer.offerPositions.map((position) => ({
        id: position.id,
        productId: position.productId,
        quantity: position.quantity,
        free_months: position.free_months,
        optional: position.isOptional ?? false,
        ...storedPrice(position),
        translations: position.product.translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: t.description,
            table: t.table,
        })),
    }));

    const flatRates = offer.offerFlatRates.map((fr) => ({
        total_cents: fr.total_cents,
        translations: fr.flatRate.translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: null,
            table: t.table,
        })),
    }));
    const discounts = offer.offerDiscounts.map((d) => ({
        title: d.title,
        description: d.description,
        amount_cents: d.amount_cents,
    }));

    const flatRatesTotal = flatRates.reduce((sum, fr) => sum + fr.total_cents, 0);
    const discountsTotal = discounts.reduce((sum, d) => sum + d.amount_cents, 0);
    const tableTotal = (items: PositionAmounts[]) =>
        items.reduce((sum, item) => sum + netCents(item), 0) + flatRatesTotal - discountsTotal;

    const mainItems = positions.map((position) => ({ positionId: position.id, ...storedPrice(position) }));
    const tables: PriceTableModel[] = [
        { contractId: offer.contractId, items: mainItems, total_cents: tableTotal(mainItems) },
    ];

    const otherContracts = contracts.filter((c) => c.id !== offer.contractId);
    const comparisonContracts = offer.showsFeatureComparison ? otherContracts.map(toContract) : [];

    for (const contract of comparisonContracts) {
        const items: PriceTableModel["items"] = [];
        let complete = true;

        for (const position of offer.offerPositions) {
            const result = await calculatePrice({
                productId: position.productId,
                contractId: contract.id,
                duration: duration_months,
                quantity: position.quantity,
                customerId: offer.customerId,
            });
            if (!result.ok) {
                complete = false;
                break;
            }
            items.push({
                positionId: position.id,
                ...livePrice(result.breakdown.unitPrice, position, duration_months),
            });
        }

        if (complete) tables.push({ contractId: contract.id, items, total_cents: tableTotal(items) });
    }

    return {
        quoteId: offer.quoteNumber,
        language: offer.language,
        date: iso(offer.date),
        validUntil: iso(offer.validUntil),
        requestFrom: iso(offer.requestFrom),
        paymentTerm: offer.paymentTerm,
        supplierId: offer.supplierId ?? null,
        compare: offer.showsFeatureComparison,
        duration_months,

        customer: {
            customerId: offer.customer.customerId,
            companyName: offer.customer.companyName,
            street: offer.customer.street,
            zip: offer.customer.zip,
            city: offer.customer.city,
            phone: offer.customer.phone,
        },
        contactPerson: {
            salutation: offer.contactPerson.salutation,
            firstName: offer.contactPerson.firstName,
            lastName: offer.contactPerson.lastName,
            email: offer.contactPerson.email,
        },
        employee: {
            salutation: offer.user.salutation,
            firstName: offer.user.firstName,
            lastName: offer.user.lastName,
            phone: offer.user.phone,
            email: offer.user.email,
        },

        contract: toContract(offer.contract),
        comparisonContracts,
        positions,
        flatRates,
        discounts,
        tables,
    };
}
