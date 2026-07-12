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
import { offerSchema } from "../../schemas/templates/offer-template-schema.js";
import { pickTranslation } from "../../utils/i18n.js";
import { PipelineStageError } from "../pipeline.js";
import { OfferFetchData, OfferPipelineContext } from "./context.js";
import { customParser, deepIterate, resolveTemplateName } from "./utils.js";
import { OfferTemplate, OfferTemplateGroup, OfferTemplateItem, offerTemplateSchema } from "../../schemas/templates/offer.template.schema.js";
import { formatDate, formatEur } from "../../utils/utils.js";

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
export const formatOfferData = async (fetchedData: OfferFetchData): Promise<OfferTemplate> => {
    const { offer, contracts } = fetchedData;
    const { customer, customerContactPerson: cp, user: employee, offerPositions, offerFlatRates, language } = offer;

    const product_items: Array<OfferTemplateItem> = offerPositions.map(offerPosition => {
        const translation = pickTranslation(offerPosition.product.translations, language);

        if (!translation) {
            throw new PipelineStageError("Translations not found!")
        }

        return {
            name: translation.name,
            description: translation.description,
            content: translation?.table ? [translation.table] : [],
            quantity: String(offerPosition.quantity),
            eur_user_month: formatEur(offerPosition.total_cents / offerPosition.quantity / offerPosition.duration_months),
            duration: String(offerPosition.duration_months),
            total: formatEur(offerPosition.total_cents),
            optional: offerPosition.optional,
        }
    });

    const groups = Object.values(Object.groupBy(offerPositions, (p) =>
        `${p.contract}_${p.duration_months}`));

    const product_groups: Array<OfferTemplateGroup> = groups.map(group => {
        const positions = group?.map(position => {
            const product = pickTranslation(position.product.translations, language);
            const contract = pickTranslation(position.contract.translations, language);

            return { ...position, product, contract };
        });

        const months_translation = pickTranslation([
            { language: "DE", text: "Monate" },
            { language: "EN", text: "Months" }
        ], language)?.text;

        return {
            names: positions?.map(p => p.product?.name).join(" & ") ?? "",
            contract: positions![0].contract?.name ?? "",
            features: positions![0].contract?.features ?? [],
            _duration: positions![0].duration_months,
            duration: `${positions![0].duration_months} ${months_translation}`,
        };
    });

    const flatrates = offerFlatRates.map(position => {
        const translation = pickTranslation(position.flatRate.translations, language);

        if (!translation) {
            throw new PipelineStageError("Translations not found!")
        }

        return {
            name: translation.name,
            content: translation.table,
            total: formatEur(position.total_cents),
        }
    });

    return {
        quoteId: offer.quoteId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: formatDate(offer.validUntil),
        requestFrom: formatDate(offer.requestFrom),
        supplierId: offer.supplierId,

        customer: {
            id: customer.customerId,
            companyName: customer.companyName,
            street: customer.street,
            zip: customer.zip,
            city: customer.city,

            fullName: `${cp.salutation} ${cp.firstName} ${cp.lastName}`,
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
            phone: employee.phone,
            email: employee.email,
        },

        products: {
            names: offerPositions.map(position => pickTranslation(position.product.translations, language)?.name).join(" & "),
            grouped: product_groups,
            items: product_items,
        },

        flatrates: flatrates
    }
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
    ) as unknown as OfferTemplate;
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
