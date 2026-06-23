import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { convert as libconvert } from "libreoffice-convert";
import { z } from "zod";
import env from "../../lib/env.js";
import { prisma } from "../../lib/prismaClient.js";
import logger from "../../middlewares/logger.js";
import { type OfferContext, offerSchema } from "../../schemas/offer-template-schema.js";
import { pickTranslation } from "../../utils/i18n.js";
import { formatDate, formatDuration, formatEur } from "../../utils/utils.js";
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

        await prisma.contract.findMany(),
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
type AugmentedContract = {
    id: string;
    name: string;
    features: string[];
    table: string;
};

const pickContractFields = (contract: AugmentedContract) => ({
    id: contract.id,
    name: contract.name,
    features: contract.features,
    table: contract.table,
});

/* Helper function */
export const formatOfferData = async (fetchedData: OfferFetchData) => {
    const { offer, contracts } = fetchedData;
    const { customer, customerContactPerson: ccp, user: employee, language } = offer;

    const offerPositions = offer.offerPositions.map((position) => {
        const product = pickTranslation(position.product.translations, language);
        const contract = pickTranslation(position.contract.translations, language);

        return {
            ...position,
            product: {
                ...position.product,
                name: product?.name ?? "",
                description: product?.description ?? "",
                table: product?.table ?? "",
            },
            contract: {
                ...position.contract,
                name: contract?.name ?? "",
                features: contract?.features ?? [],
                table: contract?.table ?? "",
            }
        };
    });

    const offerFlatRates = offer.offerFlatRates.map((fr) => {
        const ft = pickTranslation(fr.flatRate.translations, language);
        return {
            ...fr,
            flatRate: {
                ...fr.flatRate,
                name: ft?.name ?? "",
                table: ft?.table ?? ""
            }
        };
    });

    const products = offerPositions.map((position) => ({
        id: position.product.id,
        name: position.product.name,
        description: position.product.description,
        table: position.product.table,
        contract: pickContractFields(position.contract),
        duration_months: position.duration_months,
        duration: formatDuration(position.duration_months),
    }));

    const groups = Object.groupBy(offerPositions, (p) =>
        `${p.contract.id}_${p.duration_months}`);

    const grouped = Object.values(groups).map((group) => {
        const first = group![0];

        const group_total = group?.reduce((sum, p) => sum + p.total_cents, 0);

        return {
            names: group?.map((p) => p.product.name).join(" & "),
            contract: pickContractFields(first.contract),
            duration_months: first.duration_months,
            duration: formatDuration(first.duration_months),
            total: formatEur(group_total! / 100),
            items: group?.map((item) => ({
                name: item.product.name,
                description: item.product.description,
                table: item.product.table,
                quantity: item.quantity,
                optional: item.optional ?? false,
                contract: pickContractFields(item.contract),
                duration_months: item.duration_months,
                price: {
                    total: formatEur(item.total_cents / 100),
                    unit: formatEur(
                        item.quantity && item.duration_months
                            ? item.total_cents / item.quantity / item.duration_months / 100
                            : 0
                    ),
                },
            })),
        };
    });

    const flatRates = offerFlatRates.map((fr) => ({
        id: fr.id,
        quantity: fr.quantity,
        total_cents: fr.total_cents,
        flatRate: {
            id: fr.flatRate.id,
            name: fr.flatRate.name,
            table: fr.flatRate.table,
        },
        price: {
            total: formatEur(fr.total_cents / 100),
        },
    }));

    return {
        quoteId: offer.quoteId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: offer.validUntil ? formatDate(offer.validUntil) : "",
        requestFrom: offer.requestFrom ? formatDate(offer.requestFrom) : "",
        supplierId: offer.supplierId || "",

        customer: {
            id: customer.customerId || "",
            companyName: customer.companyName || "",
            street: customer.street || "",
            plz: customer.plz || "",
            city: customer.city || "",

            fullName: [ccp.salutation, ccp.firstName, ccp.lastName].filter(Boolean).join(" "),
            salutation: ccp.salutation || "",
            firstName: ccp.firstName || "",
            lastName: ccp.lastName || "",
            phone: customer.phone || "",
            email: customer.email || "",
        },

        employee: {
            fullName: [employee.salutation, employee.firstName, employee.lastName].filter(Boolean).join(" "),
            salutation: employee.salutation || "",
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            phone: employee.phone || "",
            email: employee.email || "",
        },

        products: {
            names: offerPositions.map((p) => p.product.name).join(" & "),
            grouped: grouped,
            items: [...products],
        },

        flatRates: flatRates,
    };
}

/* Stage function */
export const formatFetchedDataAction = async (context: OfferPipelineContext) => {
    if (!context.fetchedData || !context.fetchedData.offer || !context.fetchedData.contracts) {
        throw new PipelineStageError("Fetched data is empty!");
    }

    try {
        const formated = await formatOfferData(context.fetchedData);
        context.formatedData = offerSchema.parse(formated);
    } catch (exception: any) {
        if (exception instanceof z.ZodError) {
            logger.error(`[pipeline]: Formatted offer data failed schema validation: ${JSON.stringify(exception.issues)
                }`);
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
    ) as unknown as OfferContext;
}

export const prepareAction = async (context: OfferPipelineContext) => {
    await fs.mkdir(env.OUTPUT_DIR, { recursive: true });
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
    const schemaPaths = flattenSchema(offerSchema);
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

export async function writeAction(context: OfferPipelineContext) {
    const { fetchedData, documentId, version, docxBuffer, pdfBuffer } = context;

    if (!fetchedData || !documentId || version === null || !docxBuffer || !pdfBuffer) {
        throw new PipelineStageError(
            `
        Something went wrong! Failed to write to disk!
        fetchedData=${!!fetchedData}, documentId=${!!documentId}, version=${!!version}, docxBuffer=${!!docxBuffer}, pdfBuffer=${!!pdfBuffer}
      `
        );
    }

    const { quoteId, customer, offerPositions, language } = fetchedData.offer;

    const formatedCompanyName = customer.companyName.replaceAll(" ", "").trim();
    const formatedWorkloads = offerPositions
        .map((op) => (pickTranslation(op.product.translations, language)?.name ?? "").replaceAll(" ", "").trim())
        .join("+");

    context.displayName = `${quoteId}_AG_${formatedCompanyName}_Keepit-${formatedWorkloads}${version > 0 ? `_v${version}` : ''}`;

    const docxPath = path.join(env.OUTPUT_DIR, `${documentId}.docx`);
    const pdfPath = path.join(env.OUTPUT_DIR, `${documentId}.pdf`);

    await Promise.all([
        fs.writeFile(docxPath, docxBuffer!),
        fs.writeFile(pdfPath, pdfBuffer!),
    ]);

    // Expose the canonical document path (docx matches the document's format)
    // so the worker can persist it for downloads.
    context.path = docxPath;
}
