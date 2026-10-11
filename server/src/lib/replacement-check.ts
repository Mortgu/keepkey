import type { ReplacementWarning } from "@keepit/schemas";
import { readContentControls } from "./docx-controls.js";
import { readProvenance } from "./docx-provenance.js";

/**
 * Hinweise zu einer hochgeladenen Ersatz-DOCX. Sie blockieren nie: Nutzer
 * dürfen Dokumente bewusst anpassen. Das Modell am Dokument bleibt unverändert
 * (der Upload ist ein Beleg, keine Datenquelle) — die Hinweise machen nur
 * sichtbar, wo die Datei vom erzeugten Stand abweicht.
 */
/**
 * Zusätzlich zu den Hinweisen für den Nutzer meldet die Prüfung zwei Zustände,
 * die nur ins Protokoll gehören: Editor-Speicherstände tragen keine Herkunft,
 * und Dokumente aus der Zeit vor den Snapshots haben kein Modell.
 */
export type CheckedWarning =
    | ReplacementWarning
    | { code: "PROVENANCE_MISSING" }
    | { code: "MODEL_UNAVAILABLE" };

/** Nur diese Hinweise gehen an den Nutzer. */
export const isUserWarning = (warning: CheckedWarning): warning is ReplacementWarning =>
    warning.code !== "PROVENANCE_MISSING" && warning.code !== "MODEL_UNAVAILABLE";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** `customer.firstName` → Wert im Modell; nur Text, Zahlen und `null` sind vergleichbar. */
function scalarAt(model: unknown, path: string): string | null {
    let current: unknown = model;
    for (const key of path.split(".")) {
        if (current === null || typeof current !== "object") return null;
        current = (current as Record<string, unknown>)[key];
    }
    if (current === null) return "";
    return typeof current === "string" || typeof current === "number" ? String(current) : null;
}

export type FieldChange = Extract<ReplacementWarning, { code: "FIELD_CHANGED" }>;

/**
 * Felder, deren Content Control etwas anderes zeigt als das Modell. Tags, die
 * das Modell nicht kennt, sind andere Controls und werden übergangen. Bei
 * mehreren Fundstellen zählt die erste abweichende.
 */
export function diffControls(model: unknown, docx: Buffer): FieldChange[] {
    const changes: FieldChange[] = [];

    for (const [field, found] of readContentControls(docx)) {
        const expected = scalarAt(model, field);
        if (expected === null) continue;

        const actual = found.find((text) => normalize(text) !== normalize(expected));
        if (actual !== undefined) {
            changes.push({ code: "FIELD_CHANGED", field, expected: normalize(expected), actual: normalize(actual) });
        }
    }

    return changes;
}

export function checkReplacement(input: {
    documentType: string;
    documentId: string;
    model: unknown;
    docx: Buffer;
}): CheckedWarning[] {
    const { documentType, documentId, model, docx } = input;
    const provenance = readProvenance(docx);
    const warnings: CheckedWarning[] = [];

    if (!provenance) {
        warnings.push({ code: "PROVENANCE_MISSING" });
    } else if (provenance.documentId !== documentId || provenance.documentType !== documentType) {
        // Dann sind alle Feldvergleiche gegen dieses Modell sinnlos.
        return [{ code: "DOCUMENT_MISMATCH", expected: documentId, found: provenance.documentId }];
    }

    if (model === null || model === undefined) {
        return [...warnings, { code: "MODEL_UNAVAILABLE" }];
    }

    return [...warnings, ...diffControls(model, docx)];
}

/**
 * Setzt `path` im Modell auf den Text aus der Datei und liefert das neue Modell;
 * das übergebene bleibt unverändert. Der Typ des bisherigen Werts bleibt
 * erhalten: Text bleibt Text, eine Zahl muss auch als Zahl lesbar sein.
 * `null`, wenn der Pfad nicht existiert oder der Text nicht passt.
 */
export function withAdoptedValue(model: unknown, path: string, text: string): Record<string, unknown> | null {
    const next = structuredClone(model) as Record<string, unknown>;
    const keys = path.split(".");
    const last = keys.pop()!;

    let parent: unknown = next;
    for (const key of keys) {
        if (parent === null || typeof parent !== "object") return null;
        parent = (parent as Record<string, unknown>)[key];
    }
    if (parent === null || typeof parent !== "object" || !(last in parent)) return null;

    const holder = parent as Record<string, unknown>;
    const value = text.trim();
    if (typeof holder[last] === "number") {
        const parsed = Number(value);
        if (value === "" || !Number.isFinite(parsed)) return null;
        holder[last] = parsed;
    } else if (typeof holder[last] === "string" || holder[last] === null) {
        holder[last] = value;
    } else {
        return null;
    }

    return next;
}
