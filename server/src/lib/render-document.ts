import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import PizZip from "pizzip";
import type { DocumentTemplateKind, Language } from "@prisma/client";
import { z } from "zod";
import logger from "@/utils/logger.js";
import { loadTemplateForRendering } from "../services/document-template.service.js";
import { customParser, deepIterate } from "../pipelines/offer/utils.js";
import { convertDocxToPdf } from "./docx-to-pdf.js";
import { hashModel, writeProvenance } from "./docx-provenance.js";

export type RenderedDocument = {
    docxBuffer: Buffer;
    pdfBuffer: Buffer;
    /** Die Daten, aus denen gerendert wurde — Platzhalter bereits aufgelöst, JSON-sicher. */
    model: Record<string, unknown>;
    modelHash: string;
};

export type RenderProvenance = {
    documentType: string;
    documentId: string;
};

/**
 * Rendert die aktive Vorlage eines Typs mit den übergebenen Daten und liefert
 * DOCX + PDF. Das ist der Teil der Generierung, der für jeden Dokumenttyp
 * identisch ist — alles davor (Daten laden, formatieren, Namen bilden) steht
 * ausgeschrieben in der Datei des jeweiligen Typs.
 *
 * `deepIterate` löst Platzhalter wie `{product.name}` innerhalb von
 * Datenfeldern auf, bevor docxtemplater das Dokument füllt.
 *
 * Das aufgelöste Modell kommt zurück, damit der Aufrufer es am Dokument
 * speichern kann; die DOCX trägt nur Kennung und Hash davon (siehe
 * `docx-provenance`). Mit `schema` meldet der Render Platzhalter, die die
 * Vorlage liest, das Schema aber nicht kennt (Abweichung zwischen Vorlage und Code).
 */
export async function renderDocument(
    kind: DocumentTemplateKind,
    language: Language,
    data: Record<string, unknown>,
    provenance: RenderProvenance,
    options: { schema?: z.ZodType } = {},
): Promise<RenderedDocument> {
    const resolved = deepIterate(data, data);
    // Das Modell wird gespeichert: Daten wie Date müssen die JSON-Runde schon hinter sich haben.
    const model = JSON.parse(JSON.stringify(resolved)) as Record<string, unknown>;
    const modelHash = hashModel(model);

    const content = await loadTemplateForRendering(kind, language);
    const zip = new PizZip(content);
    // @ts-expect-error - inspect-module exports a function at runtime but is typed as a class
    const inspect = options.schema ? InspectModule() : null;
    const doc = new Docxtemplater(zip, {
        modules: inspect ? [inspect] : [],
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    if (inspect && options.schema) warnOnTemplateDrift(kind, inspect.getAllTags(), options.schema);

    doc.render(resolved);
    writeProvenance(doc.getZip(), { ...provenance, modelHash });

    const docxBuffer = doc.toBuffer();
    const pdfBuffer = await convertDocxToPdf(docxBuffer);
    return { docxBuffer, pdfBuffer, model, modelHash };
}

/* Drift detection: compare template tags against the data schema. */
function flattenTags(tags: Record<string, unknown>, prefix = ""): string[] {
    const out: string[] = [];
    for (const [k, v] of Object.entries(tags)) {
        if (k === ".") continue; // self-reference loop element
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && Object.keys(v as object).length > 0) {
            out.push(...flattenTags(v as Record<string, unknown>, path));
        } else {
            out.push(path);
        }
    }
    return out;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function flattenSchema(schema: any, prefix = ""): string[] {
    if (schema instanceof z.ZodObject) {
        return Object.entries(schema.shape).flatMap(([k, v]: [string, any]) =>
            flattenSchema(v, prefix ? `${prefix}.${k}` : k));
    }
    if (schema instanceof z.ZodArray) return flattenSchema(schema.element, prefix);
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
        return flattenSchema(schema.unwrap(), prefix);
    }
    return prefix ? [prefix] : [];
}

function warnOnTemplateDrift(kind: DocumentTemplateKind, tags: unknown, schema: z.ZodType): void {
    const schemaPaths = flattenSchema(schema);
    const uncovered = flattenTags(tags as Record<string, unknown>).filter((t) => !schemaPaths.includes(t));
    if (uncovered.length > 0) {
        logger.warn(
            `[render]: ${kind} template tags not covered by schema (possible drift): ${uncovered.join(", ")}`,
        );
    }
}
