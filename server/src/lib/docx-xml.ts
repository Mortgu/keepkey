import { XMLParser } from "fast-xml-parser";

/**
 * Gemeinsame Bausteine zum Lesen von WordprocessingML: ein Parser, der die
 * Reihenfolge der Knoten behält, und Zugriffe darauf.
 */
export type XmlNode = Record<string, unknown>;

/** Die Teile, in denen Text des Dokuments steht. */
export const TEXT_PARTS = /^word\/(document|header\d*|footer\d*)\.xml$/;

export const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    parseAttributeValue: false,
    // Leerzeichen in `w:t` sind Inhalt.
    trimValues: false,
});

export const nameOf = (node: XmlNode): string | undefined => Object.keys(node).find((key) => key !== ":@");
export const childrenOf = (node: XmlNode): XmlNode[] => {
    const name = nameOf(node);
    const children = name ? node[name] : undefined;
    return Array.isArray(children) ? (children as XmlNode[]) : [];
};
export const attrOf = (node: XmlNode, name: string): string | undefined =>
    (node[":@"] as Record<string, string> | undefined)?.[`@_${name}`];

/** Eigenschaftsknoten (`w:pPr`, `w:rPr`, `w:sdtPr`, …) tragen keinen Text, wohl aber `w:tab`/`w:br`-Verwandte. */
export const isProperties = (name: string) => name.endsWith("Pr");

export function textOf(nodes: XmlNode[]): string {
    let out = "";
    for (const node of nodes) {
        const name = nameOf(node);
        if (name === undefined) continue;
        if (name === "#text") {
            out += String(node["#text"]);
        } else if (name === "w:t") {
            out += textOf(childrenOf(node));
        } else if (name === "w:tab") {
            out += "\t";
        } else if (name === "w:br" || name === "w:cr") {
            out += "\n";
        } else if (name === "w:p") {
            out += `${textOf(childrenOf(node))}\n`;
        } else if (!isProperties(name)) {
            out += textOf(childrenOf(node));
        }
    }
    return out;
}
