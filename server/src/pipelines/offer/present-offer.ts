import type { Language } from "@prisma/client";
import type { OfferTemplate, OfferTemplateItem } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation, translateFields } from "@/utils/i18n.js";
import { formatParty } from "@/utils/party.js";
import { formatCentsToEur, formatDate } from "@/utils/utils.js";
import type { OfferModel, PositionAmounts, PositionModel } from "./offer-model.js";

function requireTranslation<T extends { language: Language }>(translations: T[], language: Language, what: string): T {
    const translation = pickTranslation(translations, language);
    if (!translation) throw new Error(`No translation available for ${what}.`);
    return translation;
}

const numberPrefix = (index: number, compare: boolean) => (compare ? `${index + 1}. ` : "");

export function withNumberPrefixes(template: OfferTemplate): OfferTemplate {
    return {
        ...template,
        groups: template.groups.map((group, i) => ({ ...group, numberPrefix: numberPrefix(i, template.compare) })),
        tables: template.tables.map((table, i) => ({ ...table, numberPrefix: numberPrefix(i, template.compare) })),
    };
}

function presentItem(
    position: PositionModel,
    price: PositionAmounts,
    context: { language: Language; contractName: string; validUntil: string | null; durationLabel: string },
): OfferTemplateItem {
    const translation = translateFields(position.translations, context.language, { name: "", description: "", table: "" });

    return {
        name: translation.name,
        description: translation.description,
        content: translation.table,
        quantity: String(position.quantity),
        unitCents: formatCentsToEur(price.unitCents),
        duration: context.durationLabel,
        total: formatCentsToEur(price.totalCents),
        contract: context.contractName,
        optional: position.optional,
        discount: position.freeMonths > 0 ? {
            freeMonths: position.freeMonths,
            valid_until: formatDate(context.validUntil),
            total: formatCentsToEur(-price.discountCents),
        } : null,
    };
}

export function presentOffer(model: OfferModel): OfferTemplate {
    const { language, duration_months: duration } = model;

    const contractName = (contract: OfferModel["contract"]) =>
        requireTranslation(contract.translations, language, `contract ${contract.id}`);
    const offerContract = contractName(model.contract);

    const productNames = model.positions
        .map((p) => translateFields(p.translations, language, { name: "" }).name)
        .join(" & ");

    const products = model.positions.map((position) => presentItem(position, position, {
        language,
        contractName: offerContract.name,
        validUntil: model.validUntil,
        durationLabel: `${duration} Monate`,
    }));

    const groups: OfferTemplate["groups"] = [model.contract, ...model.comparisonContracts].map((contract, i) => {
        const translation = contractName(contract);
        return {
            names: productNames,
            contract: translation.name,
            features: translation.features,
            _duration: duration,
            duration: `${duration} Monate`,
            numberPrefix: numberPrefix(i, model.compare),
        };
    });

    const flatrates = model.flatRates.map((fr) => {
        const translation = requireTranslation(fr.translations, language, "flat rate");
        return { name: translation.name, content: translation.table, total: formatCentsToEur(fr.totalCents) };
    });

    const contractsById = new Map([model.contract, ...model.comparisonContracts].map((c) => [c.id, c]));
    const positionsById = new Map(model.positions.map((p) => [p.id, p]));

    const tables: OfferTemplate["tables"] = model.tables.map((table, i) => {
        const tableContract = contractName(contractsById.get(table.contractId)!);
        return {
            products: productNames,
            contract: tableContract.name,
            duration: `${duration} Monaten`,
            numberPrefix: numberPrefix(i, model.compare),
            items: table.items.map((item) => presentItem(positionsById.get(item.positionId)!, item, {
                language,
                contractName: tableContract.name,
                validUntil: model.validUntil,
                durationLabel: String(duration),
            })),
            flatrates,
            total: formatCentsToEur(table.totalCents),
        };
    });

    const { contactPerson: cp, customer, employee } = model;

    return {
        quoteId: model.quoteId,
        date: formatDate(model.date),
        paymentTerm: model.paymentTerm,
        validUntil: formatDate(model.validUntil),
        requestFrom: formatDate(model.requestFrom),
        supplierId: model.supplierId,
        compare: model.compare,

        customer: {
            id: customer.customerId,
            companyName: customer.companyName,
            street: customer.street,
            zip: customer.zip,
            city: customer.city,
            ...formatParty({ salutation: cp.salutation, firstName: cp.firstName, lastName: cp.lastName, phone: customer.phone, email: cp.email }),
        },

        employee: formatParty({
            salutation: employee.salutation,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            email: employee.email,
        }),

        product_names: productNames,
        products,
        groups,
        tables,
        discounts: model.discounts.map((d) => ({
            title: d.title,
            description: d.description ?? "",
            total: formatCentsToEur(-d.totalCents),
        })),
    };
}
