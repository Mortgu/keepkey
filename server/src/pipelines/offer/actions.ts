import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {prisma} from "../../lib/prismaClient.js";
import {OfferFetchData, OfferFormatedData, OfferPipelineContext} from "./context.js";
import logger from "../../middlewares/logger.js";
import {PipelineStageError} from "../pipeline.js";
import {pickTranslation} from "../../utils/i18n.js";
import {formatDate, formatDuration, formatEur} from "../../utils/utils.js";
import {customParser, deepIterate} from "./utils.js";
import {convert as libconvert} from "libreoffice-convert";
import env from "../../lib/env.js";

/* Helper function */
export const fetchOfferData = async (offerId: string) => {
    const [offer, contracts] = await Promise.all([
        await prisma.offer.findUniqueOrThrow({
            where: {id: offerId},
            include: {
                customer: true,
                customerContactPerson: true,
                user: true,
                offerPositions: {
                    include: {
                        product: {include: {translations: true}},
                        contract: {include: {translations: true}},
                    },
                },
                offerFlatRates: {
                    include: {
                        flatRate: {include: {translations: true}},
                    },
                },
            }
        }),

        await prisma.contract.findMany(),
    ]);

    return {offer, contracts};
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
export const formatOfferData = async (fetchedData: OfferFetchData) => {
    const {offer, contracts} = fetchedData;
    const {customer, customerContactPerson: ccp, user: employee, language} = offer;

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
        contract: position.contract,
        ...position.product,

        duration_months: position.duration_months,
        duration: formatDuration(position.duration_months),
    }));

    const groups = Object.groupBy(offerPositions, (p) =>
        `${p.contract.id}_${p.duration_months}`);

    const grouped = Object.values(groups).map((group) => {
        const first = group![0];

        const flatrate_total = offerFlatRates?.reduce((sum, p) => sum + p.total_cents, 0);
        const group_total = group?.reduce((sum, p) => sum + p.total_cents, flatrate_total);

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

    const flatRates = offerFlatRates.map((fr) => ({
        ...fr,
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
        context.formatedData = await formatOfferData(context.fetchedData);
    } catch (exception: any) {
        logger.error(exception);
        throw new PipelineStageError("An error occurred! Please try again later.");
    }
}

export const postProcessingAction = async (context: OfferPipelineContext) => {
    const {formatedData} = context;

    if (!formatedData) {
        throw new Error("Failed to postprocess! No formatted data!");
    }

    context.formatedData = deepIterate(
        formatedData as Record<string, unknown>,
        formatedData as Record<string, unknown>,
    ) as unknown as OfferFormatedData;
}

export const prepareAction = async (context: OfferPipelineContext) => {
    await fs.mkdir(env.OUTPUT_DIR, {recursive: true});
}

export async function generateAction(context: OfferPipelineContext) {
    const {formatedData} = context;

    const content = await fs.readFile(path.join(env.TEMPLATES_DIR, "offer.docx"), "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    doc.render(formatedData);

    context.docxBuffer = doc.toBuffer();
}

export async function converteAction(context: OfferPipelineContext) {
    const {docxBuffer} = context;

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
    const {fetchedData, documentId, version, docxBuffer, pdfBuffer} = context;

    if (!fetchedData || !documentId || !version || !docxBuffer || !pdfBuffer) {
        throw new PipelineStageError("Something went wrong! Failed to write to disk!");
    }

    const {quoteId, customer, offerPositions, language} = fetchedData.offer;

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
}
