import {prisma} from "../../lib/prismaClient.js";
import {OrderFetchedData, OrderFormattedData} from "./context.js";
import {formatDate, formatDuration, formatEur} from "../../utils/utils.js";
import {pickTranslation} from "../../utils/i18n.js";
import {customParser, deepIterate} from "../offer/utils.js";
import fs from "fs/promises";
import path from "path";
import env from "../../lib/env.js";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import {convert as libconvert} from "libreoffice-convert";

export async function fetchOrderData(orderId: string) {
    const [order] = await Promise.all([
        await prisma.order.findUniqueOrThrow({
            where: {id: orderId},
            include: {
                customer: true,
                supplier: true,
                customerContactPerson: true,
                employee: true,

                orderPositions: {
                    include: {
                        product: {include: {translations: true}},
                        contract: {include: {translations: true}},
                    }
                },

                flatRates: {
                    include: {
                        flatRate: {include: {translations: true}}
                    }
                }
            }
        }),
    ]);

    return {order};
}

export async function formatOrderData(fetchedData?: OrderFetchedData) {
    if (!fetchedData) {
        throw new Error("Failed to format order data! No input fetched data.");
    }

    const order = fetchedData.order;
    const lang = "DE"; // Orders carry no language yet — default to German.
    const {customer, customerContactPerson: ccp, employee} = order;

    // Resolve the language variant once and flatten it onto each entity so the
    // docx template can keep referencing name/description/table/features directly.
    const orderPositions = order.orderPositions.map((position) => {
        const pt = pickTranslation(position.product.translations, lang);
        const ct = pickTranslation(position.contract.translations, lang);
        return {
            ...position,
            product: {...position.product, name: pt?.name ?? "", description: pt?.description ?? "", table: pt?.table ?? ""},
            contract: {...position.contract, name: ct?.name ?? "", features: ct?.features ?? [], table: ct?.table ?? ""},
        };
    });
    const flatRates = order.flatRates.map((fr) => {
        const ft = pickTranslation(fr.flatRate.translations, lang);
        return {...fr, flatRate: {...fr.flatRate, name: ft?.name ?? "", table: ft?.table ?? ""}};
    });

    const products = orderPositions.map((position) => ({
        contract: position.contract,
        ...position.product,

        duration_months: position.duration_months,
        duration: formatDuration(position.duration_months),
    }));

    const groups = Object.groupBy(
        orderPositions,
        (p) => `${p.contract.id}_${p.duration_months}`,
    );

    const grouped = Object.values(groups).map((group) => {
        const first = group![0];

        const flatRate_total = flatRates?.reduce((sum, p) => sum + p.total_cents, 0);

        const group_total = group?.reduce((sum, p) => sum + p.total_cents, flatRate_total);

        return {
            names: group?.map((p) => p.product.name).join(" & "),
            contract: first.contract,
            duration_months: first.duration_months,
            duration: formatDuration(first.duration_months),
            total: formatEur(group_total! / 100),
            items: group?.map((item) => ({
                name: item.product.name,
                description: item.product.description,
                table: item.product.table,
                quantity: item.quantity,
                optional: item.optional,
                contract: item.contract,
                duration_months: item.duration_months,
                price: {
                    total: formatEur(item.total_cents / 100),
                    unit: formatEur(
                        item.total_cents / item.quantity / item.duration_months / 100,
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
        date: formatDate(order.date),
        paymentTerm: order.paymentTerm,
        validUntil: order.validUntil ? formatDate(order.validUntil) : "",
        requestFrom: order.requestFrom ? formatDate(order.requestFrom) : "",
        supplierId: order.supplierId || "",

        customer: {
            id: customer.customerId || "",
            companyName: customer.companyName || "",
            street: customer.street || "",
            plz: customer.plz || "",
            city: customer.city || "",

            fullName: `${ccp.salutation} ${ccp.firstName} ${ccp.lastName}`,
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

        products: {
            names: orderPositions.map((p) => p.product.name).join(" & "),
            grouped: grouped,
            items: [...products],
        },

        flatRates: orderFlatRates,
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


export async function generating(formatedData?: OrderFormattedData): Promise<Buffer> {
    const content = await fs.readFile(path.join(env.TEMPLATES_DIR, "order.docx"), "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    doc.render(formatedData);

    return doc.toBuffer();
}


export async function converting(docxBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        libconvert(docxBuffer, ".pdf", undefined, (err: Error | null, result: Buffer) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}
