import PizZip from "pizzip";
import { TEXT_PARTS, attrOf, childrenOf, nameOf, parser, textOf, type XmlNode } from "./docx-xml.js";

/**
 * Liest die Inhaltssteuerelemente (Content Controls, `w:sdt`) einer DOCX aus.
 *
 * Gelesen wird, was im Dokument *steht* — also der Anzeigetext. Ein Control
 * ohne Tag (`w:tag`) ist für uns nicht adressierbar und wird übergangen. Für
 * Controls, die Word noch als Platzhaltertext zeigt (`w:showingPlcHdr`), gilt
 * der Inhalt als leer: der Platzhalter ist kein Wert, den jemand eingegeben hat.
 *
 * Ergebnis: Tag → alle Fundstellen in Dokument, Kopf- und Fußzeilen. Dasselbe
 * Tag darf mehrfach vorkommen (etwa Datum im Kopf und im Text).
 */
export type ContentControls = Map<string, string[]>;

function collect(nodes: XmlNode[], into: ContentControls): void {
    for (const node of nodes) {
        const name = nameOf(node);
        if (name === undefined || name === "#text") continue;

        const children = childrenOf(node);
        if (name === "w:sdt") {
            const properties = children.find((child) => nameOf(child) === "w:sdtPr");
            const propertyNodes = properties ? childrenOf(properties) : [];
            const tag = attrOf(propertyNodes.find((p) => nameOf(p) === "w:tag") ?? {}, "w:val");
            const content = children.find((child) => nameOf(child) === "w:sdtContent");

            if (tag && content) {
                const showsPlaceholder = propertyNodes.some((p) => nameOf(p) === "w:showingPlcHdr");
                const text = showsPlaceholder ? "" : textOf(childrenOf(content)).replace(/\n$/, "");
                into.set(tag, [...(into.get(tag) ?? []), text]);
            }
        }
        // Auch in Controls hinein, denn sie dürfen verschachtelt sein.
        collect(children, into);
    }
}

export function readContentControls(docx: Buffer): ContentControls {
    const zip = new PizZip(docx);
    const controls: ContentControls = new Map();

    for (const path of Object.keys(zip.files)) {
        if (!TEXT_PARTS.test(path)) continue;
        collect(parser.parse(zip.file(path)!.asText()) as XmlNode[], controls);
    }

    return controls;
}
