import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import fs from "fs/promises";
import PizZip from "pizzip";

import { prisma } from "@/lib/prismaClient.js";
import { offerSchema } from "@/schemas/templates/offer-template-schema.js";
import { OfferTemplate, offerTemplateSchema } from "@/schemas/templates/offer.template.schema.js";
import { pickTranslation } from "@/utils/i18n.js";
import logger from "@/utils/logger.js";
import { formatCentsToEur } from "@/utils/utils.js";
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
    return {
        quoteId: "offer.quoteId",
        date: "formatDate(offer.date)",
        paymentTerm: "offer.paymentTerm",
        validUntil: "formatDate(offer.validUntil)",
        requestFrom: "formatDate(offer.requestFrom)",
        supplierId: "offer.supplierId",
        compare: true,

        customer: {
            id: "customer.customerId",
            companyName: "customer.companyName",
            street: "customer.street",
            zip: "customer.zip",
            city: "customer.city",

            fullName: "`${cp.salutation} ${cp.firstName} ${cp.lastName}`",
            salutation: "cp.salutation",
            firstName: "cp.firstName",
            lastName: "cp.lastName",

            phone: "customer.phone",
            email: "cp.email",
        },

        employee: {
            fullName: "`${employee.salutation} ${employee.firstName} ${employee.lastName}`",
            salutation: "employee.salutation",
            firstName: "employee.firstName",
            lastName: "employee.lastName",
            phone: "employee.phone",
            email: "employee.email",
        },

        products: [
            {
                name: "Microsoft 365",
                description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                quantity: "2600",
                eur_user_month: formatCentsToEur(168),
                duration: "12 Monate",
                total: formatCentsToEur(5241600),
                contract: "Enterprise Unlimited",
                optional: false,
                discount: {
                    free_months: 3,
                    valid_until: null,
                    total: formatCentsToEur(-1310400)
                }
            },
            {
                name: "EntraID Advanced",
                description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                quantity: "2600",
                eur_user_month: formatCentsToEur(168),
                duration: "12 Monate",
                total: formatCentsToEur(5241600),
                contract: "Enterprise Unlimited",
                optional: false,
                discount: {
                    free_months: 3,
                    valid_until: null,
                    total: formatCentsToEur(-1310400)
                }
            }
        ],

        groups: [
            // Orginal Eingabe mit contract = "Enterprise Unlimited"
            {
                names: "Microsoft 365 & Entra ID Advanced",
                contract: "Enterprise Unlimited",
                features: [
                    "Datenaufbewahrung / max. Retention: unlimitiert (>99 Jahre)",
                    "API-Unterstützung für Integration von Drittanbietern",
                    "Individuelles RBAC (individuelle Anpassung von Rollen & Rechten)",
                    "24*7 Support über Telefon, Chat & eMail",
                    "Persönlicher Customer Success Manager"
                ],
                _duration: 12,
                duration: "12 Monate",
            },
            // Nur wenn compare=true => Gleiche Konfiguration nur anderer contract
            {
                names: "Microsoft 365 & Entra ID Advanced",
                contract: "Business Essentials",
                features: [
                    "Datenaufbewahrung / max. Retention: 1 Jahr",
                    "9*5 Support (Business Hours) über Chat & eMail",
                ],
                _duration: 12,
                duration: "12 Monate",
            }
        ],

        tables: [
            // Tabelle mit Orginal Eingaben (Contract = "Enterprise Unlimited")
            // und den korrekten Preisen für product+contract+duration+quantity
            {
                products: "Microsoft 365 & Entra ID Advanced",
                items: [
                    {
                        name: "Microsoft 365",
                        description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                        content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                        quantity: "2600",
                        eur_user_month: formatCentsToEur(168),
                        duration: "12",
                        total: formatCentsToEur(5241600),
                        contract: "Enterprise Unlimited",
                        optional: false,
                        discount: {
                            free_months: 3,
                            valid_until: null,
                            total: formatCentsToEur(-1310400)
                        }
                    },
                    {
                        name: "EntraID Advanced",
                        description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                        content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                        quantity: "2600",
                        eur_user_month: formatCentsToEur(90),
                        duration: "12",
                        total: formatCentsToEur(2808000),
                        contract: "Enterprise Unlimited",
                        optional: false,
                        discount: {
                            free_months: 3,
                            valid_until: null,
                            total: formatCentsToEur(-702000)
                        }
                    }
                ],
                flatrates: [
                    {
                        name: "Einrichtung",
                        content: "...",
                        total: formatCentsToEur(30000),
                    }
                ],
                total: formatCentsToEur(6067200),
            },
            // Tabelle für wenn compare=true mit dem anderen Vertrag und den anderen Preisen
            {
                products: "Microsoft 365 & Entra ID Advanced",
                items: [
                    {
                        name: "Microsoft 365",
                        description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                        content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                        quantity: "2600",
                        eur_user_month: formatCentsToEur(144),
                        duration: "12",
                        total: formatCentsToEur(4492800),
                        contract: "Business Essentials",
                        optional: false,
                        discount: {
                            free_months: 3,
                            valid_until: null,
                            total: formatCentsToEur(-1123200)
                        }
                    },
                    {
                        name: "EntraID Advanced",
                        description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                        content: `Sicherung von „Microsoft 365" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`,
                        quantity: "2600",
                        eur_user_month: formatCentsToEur(74),
                        duration: "12",
                        total: formatCentsToEur(2308800),
                        contract: "Business Essentials",
                        optional: false,
                        discount: {
                            free_months: 3,
                            valid_until: null,
                            total: formatCentsToEur(-577200)
                        }
                    }
                ],
                flatrates: [
                    {
                        name: "Einrichtung",
                        content: "...",
                        total: formatCentsToEur(30000),
                    }
                ],
                total: formatCentsToEur(5131200),
            },
        ],
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
