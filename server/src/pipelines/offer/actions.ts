import { any, unknown } from "zod";
import { prisma } from "../../lib/prisma.js";
import { formatDate, formatDuration, formatEur } from "../../utils/utils.js";
import { OfferFetchData, OfferFormatedData } from "./context.js";
import { customParser, deepIterate, interpolate } from "./utils.js";
import env from "../../lib/env.js";

import path from 'path';
import fs from 'fs/promises';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

import { convert as libconvert } from "libreoffice-convert";
import { promisify } from "util";

export async function fetchOfferData(offerId: string) {
    const [offer, contracts] = await Promise.all([
        await prisma.offer.findUniqueOrThrow({
            where: { id: offerId },
            include: {
                customer: true,
                customerContactPerson: true,
                user: true,
                offerPositions: {
                    include: {
                        product: true,
                        contract: true,
                    }
                },
                offerFlatRates: {
                    include: {
                        flatRate: true
                    }
                }
            }
        }),

        await prisma.contract.findMany(),
    ]);

    return { offer, contracts };
}

export async function formatFetchedData(fetchedData?: OfferFetchData) {
    if (!fetchedData) {
        throw new Error("Failed to format! No input fetched data!");
    }

    const offer = fetchedData.offer;
    const { customer, customerContactPerson: ccp, user: employee, offerPositions, offerFlatRates } = offer;

    const products = offerPositions.map(position => ({
        contract: position.contract,
        ...position.product,

        duration_months: position.duration_months,
        duration: formatDuration(position.duration_months),
    }));

    const groups = Object.groupBy(offerPositions, p => `${p.contract.id}_${p.duration_months}`);
    const grouped = Object.values(groups).map((group) => {
        const first = group![0];

        const flatrate_total = offerFlatRates?.reduce((sum, p) => sum + p.total_cents, 0);
        const group_total = group?.reduce((sum, p) => sum + p.total_cents, flatrate_total);

        return {
            names: group?.map(p => p.product.name).join(" & "),
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
                duration_months: item.duration_months,
                price: {
                    total: formatEur(item.total_cents / 100),
                    unit: formatEur(item.total_cents / item.quantity / item.duration_months / 100),
                },
            }))
        }
    });

    const flatRates = offerFlatRates.map(fr => ({
        ...fr,
        price: {
            total: formatEur(fr.total_cents / 100),
        }
    }))

    return {
        voucherId: offer.voucherId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: offer.validUntil ? formatDate(offer.validUntil) : "",
        requestFrom: offer.requestFrom ? formatDate(offer.requestFrom) : "",
        supplierId: offer.supplierId.slice(0, 8),

        customer: {
            id: customer.customerId || '',
            companyName: customer.companyName || '',
            street: customer.street || '',
            plz: customer.plz || '',
            city: customer.city || '',

            fullName: `${ccp.salutation} ${ccp.firstName} ${ccp.lastName}`,
            salutation: ccp.salutation || '',
            firstName: ccp.firstName || '',
            lastName: ccp.lastName || '',
            phone: customer.phone || '',
            email: customer.email || '',
        },

        employee: {
            fullName: `${employee.salutation} ${employee.firstName} ${employee.lastName}`,
            salutation: employee.salutation || '',
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            phone: employee.phone || '',
            email: employee.email || '',
        },

        products: {
            names: offerPositions.map(p => p.product.name).join(' & '),
            grouped: grouped,
            items: [...products]
        },

        flatRates: flatRates,
    };
}

export async function postprocessing(formatedData?: OfferFormatedData): Promise<OfferFormatedData> {
    if (!formatedData) throw new Error("Failed to postprocess! No formatted data!");
    return deepIterate(formatedData as Record<string, unknown>, formatedData as Record<string, unknown>) as unknown as OfferFormatedData;
}

export async function generating(formatedData?: OfferFormatedData): Promise<Buffer> {
    const content = await fs.readFile(path.join(env.TEMPLATES_DIR, "offer.docx"), "binary");
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
    const convertAsync = promisify(libconvert);
    return convertAsync(docxBuffer, ".pdf", undefined) as Promise<Buffer>;
}