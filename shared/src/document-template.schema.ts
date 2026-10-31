import { z } from "zod";

import { languageSchema } from "./language.schema.js";

/**
 * Dokumentart, für die eine Vorlage gilt.
 *
 * Bewusst getrennt von {@link documentTypeSchema}: der dort steht für ein
 * bereits erzeugtes Dokument und wird kleingeschrieben als Pfadsegment
 * benutzt. Vorlagen gibt es dagegen auch für Dokumentarten, die noch gar nicht
 * erzeugt werden können — `INVOICE` kommt später genau hier dazu.
 */
export const documentTemplateTypeSchema = z.enum(["OFFER", "ORDER", "CONFIRMATION", "INVOICE"]);
export type DocumentTemplateType = z.infer<typeof documentTemplateTypeSchema>;

export const DOCUMENT_TEMPLATE_TYPES = documentTemplateTypeSchema.options;
export const DOCUMENT_TEMPLATE_LANGUAGES = languageSchema.options;

export const documentTemplateSchema = z.object({
    id: z.string(),

    type: documentTemplateTypeSchema,
    language: languageSchema,

    name: z.string(),
    fileName: z.string(),

    objectKey: z.string(),
    size: z.number(),
    sha256: z.string(),

    /** Die Vorlage, gegen die dieser Slot gerade gerendert wird. */
    isActive: z.boolean(),

    createdById: z.string().nullish(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type DocumentTemplate = z.infer<typeof documentTemplateSchema>;

/**
 * Ein Slot ist ein Paar aus Dokumentart und Sprache — die Einheit, für die
 * genau eine Vorlage aktiv sein kann.
 */
export type DocumentTemplateSlot = {
    type: DocumentTemplateType;
    language: z.infer<typeof languageSchema>;
    active?: DocumentTemplate;
    templates: Array<DocumentTemplate>;
};

export const findActiveTemplate = (
    templates: Array<DocumentTemplate>,
    type: DocumentTemplateType,
    language: z.infer<typeof languageSchema>,
) => templates.find((template) =>
    template.type === type && template.language === language && template.isActive);

/**
 * Ordnet die flache Liste den Slots zu — in fester Reihenfolge, damit die
 * Verwaltung auch dann alle Slots zeigt, wenn für manche noch nichts
 * hochgeladen wurde.
 */
export const groupTemplatesBySlot = (
    templates: Array<DocumentTemplate>,
): Array<DocumentTemplateSlot> =>
    DOCUMENT_TEMPLATE_TYPES.flatMap((type) =>
        DOCUMENT_TEMPLATE_LANGUAGES.map((language) => ({
            type,
            language,
            active: findActiveTemplate(templates, type, language),
            templates: templates.filter((template) =>
                template.type === type && template.language === language),
        })));
