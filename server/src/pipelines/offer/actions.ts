import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import fs from "fs/promises";
import PizZip from "pizzip";

import { prisma } from "@/lib/prismaClient.js";
import { OfferTemplate, offerTemplateSchema } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation } from "@/utils/i18n.js";
import logger from "@/utils/logger.js";
import { calculatePrice } from "@/utils/products.js";
import { formatCentsToEur, formatDate } from "@/utils/utils.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { convert as libconvert } from "libreoffice-convert";
import { z } from "zod";
import { PipelineStageError } from "../pipeline.js";
import { OfferFetchData, OfferPipelineContext } from "./context.js";
import { customParser, deepIterate, resolveTemplateName } from "./utils.js";

/* Helper function */
export const fetchOfferData = async (offerId: string) => {
    const [offer, contracts] = await Promise.all([
        await prisma.offer.findUniqueOrThrow({
            where: { id: offerId },
            include: {
                customer: true,
                customerContactPerson: true,
                user: true,
                offerPositions: {
                    include: {
                        product: { include: { translations: true } },
                        contract: { include: { translations: true } },
                    },
                },
                offerFlatRates: {
                    include: {
                        flatRate: { include: { translations: true } },
                    },
                },
            }
        }),

        await prisma.contract.findMany({
            include: {
                translations: true,
            }
        }),
    ]);

    return { offer, contracts };
}

/* Stage function */
export const fetchOfferAction = async (context: OfferPipelineContext) => {
    try {
        context.fetchedData = await fetchOfferData(context.offerId);
    } catch (exception: any) {
        if (exception instanceof PrismaClientKnownRequestError) {
            logger.error("[pipline]: Prisma error: Something failed while trying to fetch data!")
        }

        logger.error(exception);
        throw new PipelineStageError("An error occurred! Please try again later.");
    }
}

/* Helper function */
export const formatOfferData = async (fetchedData: OfferFetchData): Promise<OfferTemplate> => {
    const { offer, contracts } = fetchedData;
    const language = offer.language;
    const customerId = offer.customerId;

    const products = offer.offerPositions.map(pos => {
        const productT = pickTranslation(pos.product.translations, language)!;
        const contractT = pickTranslation(pos.contract.translations, language)!;
        const discountTotal = pos.free_months * pos.eur_user_month * pos.quantity;

        return {
            name: productT.name,
            description: productT.description ?? "",
            content: productT.table ?? "",
            quantity: String(pos.quantity),
            eur_user_month: formatCentsToEur(pos.eur_user_month),
            duration: `${pos.duration_months} Monate`,
            total: formatCentsToEur(pos.total_cents),
            contract: contractT.name,
            optional: pos.optional ?? false,
            discount: {
                free_months: pos.free_months,
                valid_until: formatDate(offer.validUntil),
                total: formatCentsToEur(discountTotal),
            },
        };
    });

    const groupMap = new Map<string, typeof offer.offerPositions>();
    for (const pos of offer.offerPositions) {
        const key = `${pos.contractId}_${pos.duration_months}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(pos);
    }

    const originalContractIds = new Set(offer.offerPositions.map(p => p.contractId));
    const otherContracts = contracts.filter(c => !originalContractIds.has(c.id));

    const groups: OfferTemplate["groups"] = [];

    for (const [, positions] of groupMap) {
        const firstPos = positions[0];
        const contractT = pickTranslation(firstPos.contract.translations, language)!;
        const productNames = positions
            .map(p => pickTranslation(p.product.translations, language)?.name ?? "")
            .join(" & ");

        groups.push({
            names: productNames,
            contract: contractT.name,
            features: contractT.features,
            _duration: firstPos.duration_months,
            duration: `${firstPos.duration_months} Monate`,
        });

        if (offer.featureComparison) {
            for (const otherContract of otherContracts) {
                const otherContractT = pickTranslation(otherContract.translations, language)!;
                groups.push({
                    names: productNames,
                    contract: otherContractT.name,
                    features: otherContractT.features,
                    _duration: firstPos.duration_months,
                    duration: `${firstPos.duration_months} Monate`,
                });
            }
        }
    }

    const flatrates = offer.offerFlatRates.map(fr => {
        const frT = pickTranslation(fr.flatRate.translations, language)!;
        return {
            name: frT.name,
            content: frT.table,
            total: formatCentsToEur(fr.total_cents),
        };
    });
    const flatratesTotal = offer.offerFlatRates.reduce((sum, fr) => sum + fr.total_cents, 0);

    const tables: OfferTemplate["tables"] = [];

    const buildTableForContract = async (
        contractId: string,
        productNames: string,
        positions: typeof offer.offerPositions,
    ) => {
        const items: OfferTemplate["products"] = [];
        let itemsTotalCents = 0;

        for (const pos of positions) {
            const productT = pickTranslation(pos.product.translations, language)!;
            const contractT = pickTranslation(
                contracts.find(c => c.id === contractId)!.translations,
                language,
            )!;

            const priceResult = await calculatePrice({
                productId: pos.productId,
                contractId,
                duration: pos.duration_months,
                quantity: pos.quantity,
                customerId,
                freeMonths: pos.free_months,
            });

            const totalCents = priceResult.ok ? priceResult.price : 0;
            const unitPrice = priceResult.ok ? priceResult.breakdown.unitPrice : 0;
            const discountCents = pos.free_months * unitPrice * pos.quantity;

            itemsTotalCents += totalCents;

            items.push({
                name: productT.name,
                description: productT.description ?? "",
                content: productT.table ?? "",
                quantity: String(pos.quantity),
                eur_user_month: formatCentsToEur(unitPrice),
                duration: String(pos.duration_months),
                total: formatCentsToEur(totalCents),
                contract: contractT.name,
                optional: pos.optional ?? false,
                discount: {
                    free_months: pos.free_months,
                    valid_until: formatDate(offer.validUntil),
                    total: formatCentsToEur(discountCents),
                },
            });
        }

        const tableTotalCents = itemsTotalCents + flatratesTotal;

        console.log(items[0].contract);

        return {
            products: productNames,
            contract: items[0].contract,
            duration: `${items[0].duration} Monaten`,
            items,
            flatrates,
            total: formatCentsToEur(tableTotalCents),
        };
    };

    for (const [, positions] of groupMap) {
        const firstPos = positions[0];
        const productNames = positions
            .map(p => pickTranslation(p.product.translations, language)?.name ?? "")
            .join(" & ");

        tables.push(
            await buildTableForContract(firstPos.contractId, productNames, positions),
        );

        if (offer.featureComparison) {
            for (const otherContract of otherContracts) {
                tables.push(
                    await buildTableForContract(otherContract.id, productNames, positions),
                );
            }
        }
    }

    const cp = offer.customerContactPerson;
    const customer = offer.customer;
    const employee = offer.user;

    const productNames = offer.offerPositions
        .map(p => pickTranslation(p.product.translations, language)?.name ?? "")
        .join(" & ");

    return {
        quoteId: offer.quoteId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: formatDate(offer.validUntil),
        requestFrom: formatDate(offer.requestFrom),
        supplierId: offer.supplierId ?? null,
        compare: offer.featureComparison,

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
    };
}

/* Stage function */
export const formatFetchedDataAction = async (context: OfferPipelineContext) => {
    if (!context.fetchedData || !context.fetchedData.offer || !context.fetchedData.contracts) {
        throw new PipelineStageError("Fetched data is empty!");
    }

    try {
        const formated = await formatOfferData(context.fetchedData);
        context.formatedData = offerTemplateSchema.parse(formated);
    } catch (exception: any) {
        if (exception instanceof z.ZodError) {
            logger.error(exception)
            logger.error('pipeline_offer_validation_failed', { issues: exception.issues });
        } else {
            logger.error(exception);
        }
        throw new PipelineStageError("An error occurred! Please try again later.");
    }
}

export const postProcessingAction = async (context: OfferPipelineContext) => {
    const { formatedData } = context;

    if (!formatedData) {
        throw new Error("Failed to postprocess! No formatted data!");
    }

    context.formatedData = deepIterate(
        formatedData as Record<string, unknown>,
        formatedData as Record<string, unknown>,
    ) as unknown as OfferTemplate;
}

/* Drift detection: compare template tags against the offer schema. */
const flattenTags = (tags: Record<string, unknown>, prefix = ""): string[] => {
    const out: string[] = [];
    for (const [k, v] of Object.entries(tags)) {
        if (k === ".") continue; // self-reference loop element
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && Object.keys(v as object).length > 0) {
            const children = flattenTags(v as Record<string, unknown>, path);
            out.push(...children);
        } else {
            out.push(path);
        }
    }
    return out;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const flattenSchema = (schema: any, prefix = ""): string[] => {
    if (schema instanceof z.ZodObject) {
        return Object.entries(schema.shape).flatMap(([k, v]: [string, any]) =>
            flattenSchema(v, prefix ? `${prefix}.${k}` : k)
        );
    }
    if (schema instanceof z.ZodArray) {
        return flattenSchema(schema.element, prefix);
    }
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
        return flattenSchema(schema.unwrap(), prefix);
    }
    return prefix ? [prefix] : [];
};

export async function generateAction(context: OfferPipelineContext) {
    const { formatedData } = context;
    // @ts-expect-error - inspect-module exports a function at runtime but is typed as a class
    const iModule = InspectModule();

    const content = await fs.readFile(
        resolveTemplateName("offer", context.fetchedData!.offer.language),
        "binary"
    );

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        modules: [iModule],
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    const tags = iModule.getAllTags();
    const templatePaths = flattenTags(tags as Record<string, unknown>);

    const schemaPaths = flattenSchema(offerTemplateSchema);
    const uncovered = templatePaths.filter((t) => !schemaPaths.includes(t));
    if (uncovered.length > 0) {
        logger.warn(
            `[pipeline]: Template tags not covered by offer schema (possible drift): ${uncovered.join(", ")
            }`
        );
    }

    doc.render(formatedData);

    context.docxBuffer = doc.toBuffer();
}

export async function convertAction(context: OfferPipelineContext) {
    const { docxBuffer } = context;

    if (!docxBuffer) {
        throw new PipelineStageError("Something went wrong! Empty docx buffer.");
    }

    context.pdfBuffer = await new Promise((resolve, reject) => {
        libconvert(docxBuffer, ".pdf", undefined, (err: Error | null, result: Buffer) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

export async function createDisplayNameAction(context: OfferPipelineContext) {
    const { fetchedData, version } = context;

    if (!fetchedData || version === null) {
        throw new PipelineStageError("Failed to create document display name.");
    }

    const { quoteId, customer, offerPositions, language } = fetchedData.offer;

    const formatedCompanyName = customer.companyName.replaceAll(" ", "").trim();
    const formatedWorkloads = offerPositions
        .map((op) => (pickTranslation(op.product.translations, language)?.name ?? "").replaceAll(" ", "").trim())
        .join("+");

    context.displayName = `${quoteId}_AG_${formatedCompanyName}_Keepit-${formatedWorkloads}${version > 0 ? `_v${version}` : ''}`;
}
