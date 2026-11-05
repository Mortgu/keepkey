import { netCents } from "@keepit/schemas";
import { calculatePrice } from "@/utils/products.js";
import type { OfferFetchData } from "./build-offer.js";
import type { ContractModel, OfferModel, PositionAmounts, PositionModel, PriceTableModel } from "./offer-model.js";

const storedPrice = (position: PositionAmounts): PositionAmounts => ({
    unitCents: position.unitCents,
    totalCents: position.totalCents,
    discountCents: position.discountCents,
});

const livePrice = (
    unitPrice: number,
    position: { quantity: number; freeMonths: number },
    duration_months: number,
): PositionAmounts => ({
    unitCents: unitPrice,
    totalCents: unitPrice * position.quantity * duration_months,
    discountCents: unitPrice * position.quantity * position.freeMonths,
});

const iso = (date: Date | string | null | undefined): string | null =>
    date === null || date === undefined ? null : new Date(date).toISOString();

const toContract = (contract: OfferFetchData["contracts"][number]): ContractModel => ({
    id: contract.id,
    translations: contract.translations.map((t) => ({ language: t.language, name: t.name, features: t.features })),
});

export async function computeOfferModel({ offer, contracts }: OfferFetchData): Promise<OfferModel> {
    const duration_months = offer.duration_months;

    const positions: PositionModel[] = offer.offerPositions.map((position) => ({
        id: position.id,
        productId: position.productId,
        quantity: position.quantity,
        freeMonths: position.freeMonths,
        optional: position.optional ?? false,
        ...storedPrice(position),
        translations: position.product.translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: t.description,
            table: t.table,
        })),
    }));

    const flatRates = offer.offerFlatRates.map((fr) => ({
        totalCents: fr.totalCents,
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
        totalCents: d.totalCents,
    }));

    const flatRatesTotal = flatRates.reduce((sum, fr) => sum + fr.totalCents, 0);
    const discountsTotal = discounts.reduce((sum, d) => sum + d.totalCents, 0);
    const tableTotal = (items: PositionAmounts[]) =>
        items.reduce((sum, item) => sum + netCents(item), 0) + flatRatesTotal - discountsTotal;

    const mainItems = positions.map((position) => ({ positionId: position.id, ...storedPrice(position) }));
    const tables: PriceTableModel[] = [
        { contractId: offer.contractId, items: mainItems, totalCents: tableTotal(mainItems) },
    ];

    const otherContracts = contracts.filter((c) => c.id !== offer.contractId);
    const comparisonContracts = offer.featureComparison ? otherContracts.map(toContract) : [];

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

        if (complete) tables.push({ contractId: contract.id, items, totalCents: tableTotal(items) });
    }

    return {
        quoteId: offer.quoteId,
        language: offer.language,
        date: iso(offer.date),
        validUntil: iso(offer.validUntil),
        requestFrom: iso(offer.requestFrom),
        paymentTerm: offer.paymentTerm,
        supplierId: offer.supplierId ?? null,
        compare: offer.featureComparison,
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
            salutation: offer.customerContactPerson.salutation,
            firstName: offer.customerContactPerson.firstName,
            lastName: offer.customerContactPerson.lastName,
            email: offer.customerContactPerson.email,
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
