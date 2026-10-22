import PizZip from "pizzip";
import { attrOf, childrenOf, isProperties, nameOf, parser, textOf, type XmlNode } from "./docx-xml.js";

/**
 * Der Text des Dokuments als Zeilen — für Tests, die ein gerendertes Dokument
 * festhalten. Sichtbar bleibt, was die Struktur ausmacht: Listenabsätze
 * (`*`, je Ebene eingerückt), Tabellenzeilen (`| Zelle | Zelle |`) und
 * leere Listenpunkte. Leere normale Absätze fallen weg.
 *
 * Nur der Haupttext (`word/document.xml`); Kopf- und Fußzeilen bleiben außen vor.
 */
export function readDocumentLines(docx: Buffer): string[] {
    const part = new PizZip(docx).file("word/document.xml");
    if (!part) return [];

    const lines: string[] = [];
    walk(parser.parse(part.asText()) as XmlNode[], lines);
    return lines;
}

function paragraphLine(paragraph: XmlNode): string | null {
    const children = childrenOf(paragraph);
    const text = textOf(children.filter((child) => nameOf(child) !== "w:p")).replace(/\n$/, "");

    const properties = children.find((child) => nameOf(child) === "w:pPr");
    const numbering = properties ? childrenOf(properties).find((p) => nameOf(p) === "w:numPr") : undefined;
    if (numbering) {
        const level = Number(attrOf(childrenOf(numbering).find((n) => nameOf(n) === "w:ilvl") ?? {}, "w:val") ?? 0);
        return `${"  ".repeat(level)}* ${text}`.trimEnd();
    }
    return text === "" ? null : text;
}

function cellText(cell: XmlNode): string {
    const lines: string[] = [];
    walk(childrenOf(cell), lines);
    return lines.join(" / ");
}

function walk(nodes: XmlNode[], out: string[]): void {
    for (const node of nodes) {
        const name = nameOf(node);
        if (name === undefined || name === "#text" || isProperties(name)) continue;

        if (name === "w:p") {
            const line = paragraphLine(node);
            if (line !== null) out.push(line);
        } else if (name === "w:tr") {
            const cells = childrenOf(node).filter((child) => nameOf(child) === "w:tc").map(cellText);
            out.push(`| ${cells.join(" | ")} |`);
        } else {
            walk(childrenOf(node), out);
        }
    }
}
