import type { Language } from "@prisma/client";
import type { OfferTemplate, OfferTemplateItem } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation } from "@/utils/i18n.js";
import { formatCentsToEur, formatDate } from "@/utils/utils.js";
import type { OfferModel, PositionAmounts, PositionModel } from "./offer-model.js";

function requireTranslation<T extends { language: Language }>(translations: T[], language: Language, what: string): T {
    const translation = pickTranslation(translations, language);
    if (!translation) throw new Error(`No translation available for ${what}.`);
    return translation;
}

/**
 * Nummer vor der Überschrift einer Offerte. Nur Vergleichsangebote bestehen aus
 * mehreren, alternativen Offerten, die sich beziehen müssen; ein einzelnes
 * Angebot trägt keine Nummer.
 */
const numberPrefix = (index: number, compare: boolean) => (compare ? `${index + 1}. ` : "");

/**
 * Setzt die Nummern an Gruppen und Tabellen neu. Für Dokumente, die aus einem
 * eingefrorenen Snapshot kommen: der stammt aus der Zeit vor den Nummern und
 * würde sonst ohne rendern. Idempotent — auf frisch dargestellte Daten
 * angewandt ändert es nichts.
 */
export function withNumberPrefixes(template: OfferTemplate): OfferTemplate {
    return {
        ...template,
        groups: template.groups.map((group, i) => ({ ...group, numberPrefix: numberPrefix(i, template.compare) })),
        tables: template.tables.map((table, i) => ({ ...table, numberPrefix: numberPrefix(i, template.compare) })),
    };
}

/**
 * Die einzige Stelle, an der aus einer Angebotsposition eine PDF-Zeile wird.
 *
 * Der Preis kommt als Parameter: die Haupttabelle reicht die gespeicherten
 * Werte durch, die Vergleichstabellen einen anderen Preis für denselben
 * Eintrag. Beide durchlaufen dieselbe Abbildung und können nicht
 * auseinanderlaufen.
 *
 * `total` ist **brutto** über die volle Laufzeit, der Wert der Freimonate steht
 * getrennt in `discount.total` (negativ, weil er im Dokument als eigene Zeile
 * darunter erscheint). Netto ist die Differenz — siehe `netCents` in
 * `@keepit/schemas`.
 *
 * `durationLabel` gibt der Aufrufer vor: die flache `products`-Liste rendert
 * "12 Monate", die Tabellen die nackte Zahl, weil deren Kopfzeile selbst
 * " Monaten" anhängt. Solange beide Formen im Template stecken, wäre eine
 * gemeinsame Formatierung hier eine stille Änderung am Dokument.
 */
function presentItem(
    position: PositionModel,
    price: PositionAmounts,
    context: { language: Language; contractName: string; validUntil: string | null; durationLabel: string },
): OfferTemplateItem {
    const translation = pickTranslation(position.translations, context.language);

    return {
        name: translation?.name ?? "",
        description: translation?.description ?? "",
        content: translation?.table ?? "",
        quantity: String(position.quantity),
        eur_user_month: formatCentsToEur(price.eur_user_month),
        duration: context.durationLabel,
        total: formatCentsToEur(price.total_cents),
        contract: context.contractName,
        optional: position.optional,
        discount: position.free_months > 0 ? {
            free_months: position.free_months,
            valid_until: formatDate(context.validUntil),
            total: formatCentsToEur(-price.discount_cents),
        } : null,
    };
}

/**
 * Macht aus dem Angebotsmodell die Daten der Vorlage: formatiert Beträge und
 * Daten, löst Übersetzungen auf und bildet die Gruppen, die die Vorlage
 * erwartet. Rein und synchron — es wird nichts gerechnet oder geladen.
 */
export function presentOffer(model: OfferModel): OfferTemplate {
    const { language, duration_months: duration } = model;

    const contractName = (contract: OfferModel["contract"]) =>
        requireTranslation(contract.translations, language, `contract ${contract.id}`);
    const offerContract = contractName(model.contract);

    const productNames = model.positions
        .map((p) => pickTranslation(p.translations, language)?.name ?? "")
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
        return { name: translation.name, content: translation.table, total: formatCentsToEur(fr.total_cents) };
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
            total: formatCentsToEur(table.total_cents),
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
            fullName: `${cp.salutation ?? ""} ${cp.firstName} ${cp.lastName}`.trim(),
            salutation: cp.salutation,
            firstName: cp.firstName,
            lastName: cp.lastName,
            phone: customer.phone,
            email: cp.email,
        },

        employee: {
            fullName: `${employee.salutation} ${employee.firstName} ${employee.lastName}`,
            salutation: employee.salutation,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone ?? "",
            email: employee.email,
        },

        product_names: productNames,
        products,
        groups,
        tables,
        discounts: model.discounts.map((d) => ({
            title: d.title,
            description: d.description ?? "",
            total: formatCentsToEur(-d.amount_cents),
        })),
    };
}
