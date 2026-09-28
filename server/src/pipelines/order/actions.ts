import Docxtemplater from "docxtemplater";
import type { Language } from "@prisma/client";
import PizZip from "pizzip";
import { getOrderById } from "../../services/order.service.js";
import { loadTemplateForRendering } from "../../services/document-template.service.js";
import { pickTranslation } from "../../utils/i18n.js";
import { formatDate, formatDuration, formatEur } from "../../utils/utils.js";
import { customParser, deepIterate } from "../offer/utils.js";
import { OrderFetchedData, OrderFormattedData } from "./context.js";

export async function fetchOrderData(orderId: string) {
    return { order: await getOrderById(orderId) };
}

export async function formatOrderData(fetchedData?: OrderFetchedData) {
    if (!fetchedData) {
        throw new Error("Failed to format order data! No input fetched data.");
    }

    const order = fetchedData.order;
    // Sprache und Konditionen stammen aus dem angenommenen Angebot.
    const lang = order.language;
    const { customer, customerContactPerson: ccp, employee } = order;

    // Resolve the language variant once and flatten it onto each entity so the
    // docx template can keep referencing name/description/table/features directly.
    // Vertrag und Laufzeit gelten fuer die ganze Bestellung. Sie werden einmal
    // aufgeloest und an jede Position gehaengt, damit das Template weiterhin
    // `position.contract` und `position.duration_months` lesen kann.
    const orderContractT = pickTranslation(order.contract.translations, lang);
    const contract = {
        ...order.contract,
        name: orderContractT?.name ?? "",
        features: orderContractT?.features ?? [],
        table: orderContractT?.table ?? "",
    };
    const duration_months = order.duration_months;

    const orderPositions = order.orderPositions.map((position) => {
        const pt = pickTranslation(position.product.translations, lang);
        return {
            ...position,
            duration_months,
            contract,
            product: { ...position.product, name: pt?.name ?? "", description: pt?.description ?? "", table: pt?.table ?? "" },
        };
    });
    const flatRates = order.flatRates.map((fr) => {
        const ft = pickTranslation(fr.flatRate.translations, lang);
        return { ...fr, flatRate: { ...fr.flatRate, name: ft?.name ?? "", table: ft?.table ?? "" } };
    });

    const products = orderPositions.map((position) => ({
        contract,
        ...position.product,

        duration_months,
        duration: formatDuration(duration_months),
    }));

    // Frueher nach `contract_duration` gruppiert — beides steht jetzt an der
    // Bestellung, es gibt also genau eine Gruppe.
    const grouped = [orderPositions].map((group) => {
        const group_total = order.net_amount;

        return {
            names: group.map((p) => p.product.name).join(" & "),
            contract,
            duration_months,
            duration: formatDuration(duration_months),
            total: formatEur(group_total / 100),
            items: group.map((item) => ({
                name: item.product.name,
                description: item.product.description,
                table: item.product.table,
                quantity: item.quantity,
                optional: item.optional,
                contract,
                duration_months,
                price: {
                    total: formatEur(item.total_cents / 100),
                    unit: formatEur(
                        item.quantity && duration_months
                            ? item.total_cents / item.quantity / duration_months / 100
                            : 0,
                    ),
                },
            })),
        };
    });

    const orderFlatRates = flatRates.map((fr) => ({
        ...fr,
        price: {
            total: formatEur(fr.total_cents / 100),
        },
    }));

    return {
        quoteId: order.orderId,
        orderId: order.orderId,
        projectNumber: order.projectNumber ?? "",
        projectId: order.projectNumber ?? "",
        offerId: order.offer.quoteId,
        projectDescription: order.projectDescription ?? "",
        orderDetails: order.orderDetails ?? "",
        products, groups: grouped, tables: grouped,
        flatRates: orderFlatRates, flatrates: orderFlatRates,
        total: formatEur(order.net_amount / 100),
        discounts: order.discounts.map(d => ({ ...d, total: formatEur(-d.amount_cents / 100) })),
        date: formatDate(order.date),
        paymentTerm: order.paymentTerm,
        validUntil: order.validUntil ? formatDate(order.validUntil) : "",
        requestFrom: order.requestFrom ? formatDate(order.requestFrom) : "",
        supplierId: order.supplierId || "",

        customer: {
            id: customer.customerId || "",
            companyName: customer.companyName || "",
            street: customer.street || "",
            zip: customer.zip || "",
            city: customer.city || "",

            fullName: `${ccp.salutation ?? ""} ${ccp.firstName} ${ccp.lastName}`.trim(),
            salutation: ccp.salutation || "",
            firstName: ccp.firstName || "",
            lastName: ccp.lastName || "",
            phone: customer.phone || "",
            email: customer.email || "",
        },

        employee: {
            fullName: `${employee.salutation} ${employee.firstName} ${employee.lastName}`,
            salutation: employee.salutation || "",
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            phone: employee.phone || "",
            email: employee.email || "",
        },
    };
}

export async function postprocessing(formatedData?: OrderFormattedData): Promise<OrderFormattedData> {
    if (!formatedData) {
        throw new Error("Failed to postprocess! No formatted data!");
    }

    return deepIterate(
        formatedData as Record<string, unknown>,
        formatedData as Record<string, unknown>,
    ) as unknown as OrderFormattedData;
}


export async function generating(
    formatedData: OrderFormattedData | undefined,
    language: Language,
): Promise<Buffer> {
    const content = await loadTemplateForRendering("ORDER", language);

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    doc.render(formatedData);

    return doc.toBuffer();
}
