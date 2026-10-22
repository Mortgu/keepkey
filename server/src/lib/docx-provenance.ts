import { createHash } from "crypto";
import PizZip from "pizzip";

/**
 * Herkunftsangaben, die in jedes erzeugte DOCX als benutzerdefinierte
 * Dokumenteigenschaften (`docProps/custom.xml`) geschrieben werden.
 *
 * Damit lässt sich eine später hochgeladene DOCX dem Dokument und dem
 * gespeicherten Modell zuordnen, aus dem sie entstanden ist. Word und
 * LibreOffice behalten diese Eigenschaften beim Speichern bei. Bewusst nur
 * Kennungen und ein Hash — nie Inhalte, denn die DOCX geht an Kunden.
 */
export type DocxProvenance = {
    documentType: string;
    documentId: string;
    modelHash: string;
};

const CUSTOM_PROPS_PATH = "docProps/custom.xml";
const FMTID = "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}";
const PREFIX = "keepit.";
const NAMES = {
    documentType: `${PREFIX}documentType`,
    documentId: `${PREFIX}documentId`,
    modelHash: `${PREFIX}modelHash`,
} as const;

const EMPTY_PART = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
    + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`;

const PROPERTY = /<property\b[^>]*>[\s\S]*?<\/property>/g;
const PROPERTY_NAME = /\bname="([^"]*)"/;
const PROPERTY_PID = /\bpid="(\d+)"/;
const PROPERTY_VALUE = /<vt:lpwstr>([\s\S]*?)<\/vt:lpwstr>/;

const escapeXml = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unescapeXml = (value: string) =>
    value.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");

/** Stabile Serialisierung: gleiche Daten ergeben unabhängig von der Schlüsselreihenfolge denselben Hash. */
function canonicalJson(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
    }
    return JSON.stringify(value) ?? "null";
}

export function hashModel(model: unknown): string {
    return createHash("sha256").update(canonicalJson(model)).digest("hex");
}

/**
 * Schreibt die Herkunft in das DOCX und lässt fremde Eigenschaften unangetastet.
 * Eine vorhandene `keepit.*`-Angabe wird ersetzt, damit ein erneut gespeichertes
 * Dokument nie zwei widersprüchliche Werte trägt.
 */
export function writeProvenance(zip: PizZip, provenance: DocxProvenance): void {
    const part = zip.file(CUSTOM_PROPS_PATH);
    if (!part) {
        // Alle Vorlagen bringen den Teil mit. Fehlt er doch, wäre Verwaltungsaufwand
        // für Beziehungen und Content-Types nötig — lieber laut scheitern.
        throw new Error(`DOCX has no ${CUSTOM_PROPS_PATH}; cannot embed provenance.`);
    }

    let xml = part.asText() || EMPTY_PART;
    let maxPid = 1;
    const kept: string[] = [];
    for (const property of xml.match(PROPERTY) ?? []) {
        const name = PROPERTY_NAME.exec(property)?.[1] ?? "";
        const pid = Number(PROPERTY_PID.exec(property)?.[1] ?? 0);
        if (!name.startsWith(PREFIX)) {
            kept.push(property);
            maxPid = Math.max(maxPid, pid);
        }
    }

    const ours = (Object.keys(NAMES) as (keyof typeof NAMES)[]).map((key, index) =>
        `<property fmtid="${FMTID}" pid="${maxPid + 1 + index}" name="${NAMES[key]}">`
        + `<vt:lpwstr>${escapeXml(provenance[key])}</vt:lpwstr></property>`);

    const open = xml.match(/<Properties\b[^>]*>/)?.[0];
    if (!open) throw new Error(`${CUSTOM_PROPS_PATH} has no <Properties> root.`);
    xml = xml.slice(0, xml.indexOf("<Properties")) + open + [...kept, ...ours].join("") + "</Properties>";

    zip.file(CUSTOM_PROPS_PATH, xml);
}

/** Liest die Herkunft aus einem DOCX; `null`, wenn sie fehlt oder unvollständig ist. */
export function readProvenance(docx: Buffer): DocxProvenance | null {
    const part = new PizZip(docx).file(CUSTOM_PROPS_PATH);
    if (!part) return null;

    const values = new Map<string, string>();
    for (const property of part.asText().match(PROPERTY) ?? []) {
        const name = PROPERTY_NAME.exec(property)?.[1];
        const value = PROPERTY_VALUE.exec(property)?.[1];
        if (name?.startsWith(PREFIX) && value !== undefined) values.set(name, unescapeXml(value));
    }

    const documentType = values.get(NAMES.documentType);
    const documentId = values.get(NAMES.documentId);
    const modelHash = values.get(NAMES.modelHash);
    return documentType && documentId && modelHash ? { documentType, documentId, modelHash } : null;
}
