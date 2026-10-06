import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type { DocumentTemplateKind, Language } from "@prisma/client";
import { loadTemplateForRendering } from "../services/document-template.service.js";
import { customParser, deepIterate } from "../pipelines/offer/utils.js";
import { convertDocxToPdf } from "./docx-to-pdf.js";

/**
 * Rendert die aktive Vorlage eines Typs mit den übergebenen Daten und liefert
 * DOCX + PDF. Das ist der Teil der Generierung, der für jeden Dokumenttyp
 * identisch ist — alles davor (Daten laden, formatieren, Namen bilden) steht
 * ausgeschrieben in der Datei des jeweiligen Typs.
 *
 * `deepIterate` löst Platzhalter wie `{product.name}` innerhalb von
 * Datenfeldern auf, bevor docxtemplater das Dokument füllt.
 */
export async function renderDocument(
    kind: DocumentTemplateKind,
    language: Language,
    data: Record<string, unknown>,
): Promise<{ docxBuffer: Buffer; pdfBuffer: Buffer }> {
    const resolved = deepIterate(data, data);

    const content = await loadTemplateForRendering(kind, language);
    const doc = new Docxtemplater(new PizZip(content), {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });
    doc.render(resolved);

    const docxBuffer = doc.toBuffer();
    const pdfBuffer = await convertDocxToPdf(docxBuffer);
    return { docxBuffer, pdfBuffer };
}
